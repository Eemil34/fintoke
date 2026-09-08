import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '@/lib/db/client';
import { getProjectById, updateProject, updateProjectActivity } from '@/lib/services/project';
import { createMessage } from '@/lib/services/message';
import { initializeNextJsProject as initializeClaudeProject, applyChanges as applyClaudeChanges } from '@/lib/services/cli/claude';
import { initializeNextJsProject as initializeCodexProject, applyChanges as applyCodexChanges } from '@/lib/services/cli/codex';
import { initializeNextJsProject as initializeCursorProject, applyChanges as applyCursorChanges } from '@/lib/services/cli/cursor';
import { initializeNextJsProject as initializeQwenProject, applyChanges as applyQwenChanges } from '@/lib/services/cli/qwen';
import { initializeNextJsProject as initializeGLMProject, applyChanges as applyGLMChanges } from '@/lib/services/cli/glm';
import { getDefaultModelForCli, normalizeModelId } from '@/lib/constants/cliModels';
import { streamManager } from '@/lib/services/stream';
import { serializeMessage } from '@/lib/serializers/chat';
import { upsertUserRequest, markUserRequestAsProcessing } from '@/lib/services/user-requests';
import { previewManager } from '@/lib/services/preview';
import { generateProjectId } from '@/lib/utils';
import { AgentApiError } from '@/lib/agent-api/keys';
import { projectsDir } from '@/lib/server/paths';

const execAsync = promisify(exec);

let cliAvailabilityCache: { at: number; claude: boolean; cursor: boolean } | null = null;

async function commandInstalled(command: string): Promise<boolean> {
  try {
    await execAsync(`${command} --version`, { timeout: 2500 });
    return true;
  } catch {
    return false;
  }
}

async function resolveBuilderCli(preferred?: string): Promise<string> {
  const requested = (preferred || 'claude').toLowerCase();
  const now = Date.now();
  if (!cliAvailabilityCache || now - cliAvailabilityCache.at > 30_000) {
    const cursorBin = process.platform === 'win32' ? 'cursor-agent.cmd' : 'cursor-agent';
    const [claude, cursor] = await Promise.all([commandInstalled('claude'), commandInstalled(cursorBin)]);
    cliAvailabilityCache = { at: now, claude, cursor };
  }

  if (requested === 'claude' && !cliAvailabilityCache.claude && cliAvailabilityCache.cursor) {
    return 'cursor';
  }
  return requested;
}

export async function startProjectInstruction(options: {
  projectId: string;
  instruction: string;
  cliPreference?: string;
  selectedModel?: string;
  isInitialPrompt?: boolean;
}): Promise<{ requestId: string; userMessageId: string }> {
  const instruction = options.instruction.trim();
  if (!instruction) {
    throw new AgentApiError('instruction is required');
  }

  const project = await getProjectById(options.projectId);
  if (!project) {
    throw new AgentApiError('Site not found', 404);
  }

  const priorUserMessages = await prisma.message.count({
    where: { projectId: options.projectId, role: 'user' },
  });
  const isInitialPrompt = options.isInitialPrompt ?? priorUserMessages === 0;

  const cliPreference = await resolveBuilderCli(options.cliPreference || project.preferredCli || 'claude');
  const selectedModel = normalizeModelId(
    cliPreference,
    options.selectedModel || project.selectedModel || getDefaultModelForCli(cliPreference),
  );
  const requestId = generateProjectId();
  const projectPath = project.repoPath || path.join(projectsDir(), options.projectId);

  const userMessage = await createMessage({
    projectId: options.projectId,
    role: 'user',
    messageType: 'chat',
    content: instruction,
    cliSource: cliPreference,
    requestId,
  });

  await upsertUserRequest({
    id: requestId,
    projectId: options.projectId,
    instruction,
    cliPreference,
  });
  await markUserRequestAsProcessing(requestId);

  streamManager.publish(options.projectId, {
    type: 'message',
    data: serializeMessage(userMessage, { requestId }),
  });

  await updateProjectActivity(options.projectId);

  if (project.preferredCli !== cliPreference || project.selectedModel !== selectedModel) {
    await updateProject(options.projectId, { preferredCli: cliPreference, selectedModel });
  }

  try {
    const status = previewManager.getStatus(options.projectId);
    if (!status.url) {
      previewManager.start(options.projectId).catch((error) => {
        console.warn('[Agent API] Failed to auto-start preview:', error);
      });
    }
  } catch (error) {
    console.warn('[Agent API] Preview auto-start check failed:', error);
  }

  const sessionId =
    cliPreference === 'claude'
      ? project.activeClaudeSessionId || undefined
      : cliPreference === 'cursor'
        ? project.activeCursorSessionId || undefined
        : undefined;

  if (isInitialPrompt) {
    const executor =
      cliPreference === 'codex'
        ? initializeCodexProject
        : cliPreference === 'cursor'
          ? initializeCursorProject
          : cliPreference === 'qwen'
            ? initializeQwenProject
            : cliPreference === 'glm'
              ? initializeGLMProject
              : initializeClaudeProject;
    executor(options.projectId, projectPath, instruction, selectedModel, requestId).catch((error) => {
      console.error('[Agent API] Failed to start agent:', error);
    });
  } else {
    const executor =
      cliPreference === 'codex'
        ? applyCodexChanges
        : cliPreference === 'cursor'
          ? applyCursorChanges
          : cliPreference === 'qwen'
            ? applyQwenChanges
            : cliPreference === 'glm'
              ? applyGLMChanges
              : applyClaudeChanges;
    executor(options.projectId, projectPath, instruction, selectedModel, sessionId, requestId).catch((error) => {
      console.error('[Agent API] Failed to run agent:', error);
    });
  }

  return { requestId, userMessageId: userMessage.id };
}
