import { NextResponse } from 'next/server';
import { previewManager } from '@/lib/services/preview';

interface RouteContext {
  params: Promise<{ project_id: string }>;
}

export async function POST(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { project_id } = await params;
    await previewManager.nudgeWatchers(project_id);
    const sourceStamp = await previewManager.sourceStamp(project_id);
    return NextResponse.json({
      success: true,
      data: { sourceStamp },
    });
  } catch (error) {
    console.error('[API] Failed to refresh preview watchers:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to refresh preview',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
