'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleAlert,
  Globe,
  LayoutTemplate,
  Mail,
  Settings,
  Table2,
  Users,
} from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { fetchDashboardJson, formatDashboardDate } from '@/lib/dashboard/client';
import { fetchCliStatusSnapshot } from '@/hooks/useCLI';
import { useTemplates } from '@/hooks/useTemplates';
import type { Project } from '@/types/project';
import type { CLIStatus } from '@/types/cli';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

interface WorkspaceSummary {
  counts: {
    users: number;
    clients: number;
    emails: number;
    drafts: number;
    work: number;
  };
}

async function tokenConnected(provider: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/tokens/${provider}`);
    return response.ok;
  } catch {
    return false;
  }
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-400'}`} />
  );
}

export default function OverviewPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceSummary['counts'] | null>(null);
  const [cliStatus, setCliStatus] = useState<CLIStatus>({});
  const [connections, setConnections] = useState({ github: false, vercel: false, supabase: false, agentKey: false });
  const [loading, setLoading] = useState(true);
  const { templates, byId } = useTemplates();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [projectPayload, workspacePayload, cli, github, vercel, supabase, agentKeys] = await Promise.all([
          fetchDashboardJson<Project[]>('/api/projects'),
          fetchDashboardJson<WorkspaceSummary>('/api/workspace'),
          fetchCliStatusSnapshot(),
          tokenConnected('github'),
          tokenConnected('vercel'),
          tokenConnected('supabase'),
          fetchDashboardJson<{ id: string }[]>('/api/agent-keys').catch(() => []),
        ]);
        if (cancelled) return;
        setProjects(projectPayload);
        setWorkspace(workspacePayload.counts);
        setCliStatus(cli);
        setConnections({ github, vercel, supabase, agentKey: agentKeys.length > 0 });
      } catch (error) {
        console.error('Failed to load dashboard overview', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const claude = cliStatus.claude;
  const cursor = cliStatus.cursor;
  const recent = projects.slice(0, 6);

  const stats = [
    { label: 'Sites', value: projects.length, href: '/dashboard/sites', icon: Globe },
    { label: 'Templates', value: templates.length, href: '/dashboard/templates', icon: LayoutTemplate },
    { label: 'Emails', value: workspace?.emails ?? 0, href: '/dashboard/emails', icon: Mail },
    { label: 'Work', value: workspace?.work ?? 0, href: '/dashboard/work', icon: Table2 },
    { label: 'Users', value: workspace?.users ?? 0, href: '/dashboard/users', icon: Users },
    { label: 'Clients', value: workspace?.clients ?? 0, href: '/dashboard/clients', icon: Building2 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <DashboardPageHeader
        title="Workspace"
        description="Sites, templates, people, and the Claude / Cursor connections for this builder."
        actions={
          <Link
            href="/dashboard/settings?tab=ai-agents"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Settings size={16} />
            Connect Claude
          </Link>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
            >
              <div className="mb-3 flex items-center justify-between text-gray-400">
                <Icon size={18} />
                <ArrowRight size={14} />
              </div>
              <p className="text-2xl font-semibold tracking-tight text-gray-900">
                {loading && stat.label !== 'Templates' ? '—' : stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Connections</h2>
            <Link href="/dashboard/settings" className="text-xs font-medium text-[#c95940] hover:underline">
              Open settings
            </Link>
          </div>
          <div className="space-y-3">
            {[
              {
                name: 'Claude Code',
                ok: Boolean(claude?.configured || claude?.installed),
                detail: claude?.checking
                  ? 'Checking…'
                  : claude?.configured || claude?.installed
                    ? 'Ready to use as the site builder'
                    : 'Not detected — add it in Settings',
                href: '/dashboard/settings?tab=ai-agents',
              },
              {
                name: 'Cursor Agent',
                ok: Boolean(cursor?.configured || cursor?.installed),
                detail: cursor?.checking
                  ? 'Checking…'
                  : cursor?.configured || cursor?.installed
                    ? 'CLI signed in'
                    : 'Install or sign in from Settings',
                href: '/dashboard/settings?tab=ai-agents',
              },
              {
                name: 'GitHub',
                ok: connections.github,
                detail: connections.github ? 'Token connected' : 'Add a token to push repos',
                href: '/dashboard/settings?tab=services',
              },
              {
                name: 'Vercel',
                ok: connections.vercel,
                detail: connections.vercel ? 'Token connected' : 'Add a token to publish sites',
                href: '/dashboard/settings?tab=services',
              },
              {
                name: 'Claude API',
                ok: connections.agentKey,
                detail: connections.agentKey
                  ? 'Key ready — add the public MCP URL in Claude.ai Connectors'
                  : 'Generate a key and add the public MCP connector in Claude.ai',
                href: '/dashboard/settings?tab=api-keys',
              },
              {
                name: 'Supabase',
                ok: connections.supabase,
                detail: connections.supabase ? 'Token connected' : 'Optional database connection',
                href: '/dashboard/settings?tab=services',
              },
            ].map((row) => (
              <Link
                key={row.name}
                href={row.href}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2.5 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <StatusDot ok={row.ok} />
                    {row.name}
                  </p>
                  <p className="truncate pl-4 text-xs text-gray-500">{row.detail}</p>
                </div>
                {row.ok ? (
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                ) : (
                  <CircleAlert size={16} className="shrink-0 text-amber-500" />
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent sites</h2>
            <Link href="/dashboard/sites" className="text-xs font-medium text-[#c95940] hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
              <p className="text-sm font-medium text-gray-900">No sites yet</p>
              <p className="mt-1 text-sm text-gray-500">Create one from a template, then it will show up here.</p>
              <Link
                href="/studio"
                className="mt-4 inline-flex rounded-xl bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                New site
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map((project) => {
                const template = project.websiteTemplateId
                  ? byId.get(project.websiteTemplateId) ?? null
                  : null;
                return (
                  <Link
                    key={project.id}
                    href={`/${project.id}/chat`}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {template?.name ?? 'Custom'} · {formatDashboardDate(project.lastActiveAt || project.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs capitalize text-gray-400">{project.status || 'idle'}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
