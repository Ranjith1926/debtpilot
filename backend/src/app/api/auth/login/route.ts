import type { NextRequest } from 'next/server';
import { loginController, firebaseLoginController } from '@/modules/auth/auth.controller';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('provider') === 'firebase') {
    return firebaseLoginController(req);
  }
  return loginController(req);
}
