import type { NextRequest } from 'next/server';
import { refreshController } from '@/modules/auth/auth.controller';

export async function POST(req: NextRequest) {
  return refreshController(req);
}
