/**
 * POST /api/projects/[id]/preview/start
 * Launches the development server for a project and returns the preview URL.
 */

import { NextResponse } from 'next/server';
import { previewManager } from '@/lib/services/preview';

interface RouteContext {
  params: Promise<{ project_id: string }>;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { project_id } = await params;
    let restart = false;
    try {
      const body = await request.json();
      restart = Boolean(body?.restart);
    } catch {
      restart = false;
    }
    const preview = await previewManager.start(project_id, { restart });

    return NextResponse.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    console.error('[API] Failed to start preview:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to start preview',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
