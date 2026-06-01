import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cronService } from '@/services/cron.service';
import { env } from '@/config/env';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await cronService.runOverdueDetection();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Cron failed' },
      { status: 500 },
    );
  }
}
