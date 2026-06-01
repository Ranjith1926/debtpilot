import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { notificationRepository } from '@/repositories/notification.repository';
import { successResponse, serverErrorResponse } from '@/utils/response';
import type { AuthenticatedUser } from '@/types';

type AuthReq = NextRequest & { user: AuthenticatedUser };

export const POST = withAuth(async (req: AuthReq) => {
  try {
    const { token, platform } = await req.json();
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, message: 'token is required' }, { status: 400 });
    }
    await notificationRepository.upsertDeviceToken(req.user.id, token, platform ?? 'android');
    return successResponse(null, 'Device token registered');
  } catch {
    return serverErrorResponse();
  }
});

export const DELETE = withAuth(async (req: AuthReq) => {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, message: 'token is required' }, { status: 400 });
    }
    await notificationRepository.deactivateDeviceToken(token);
    return successResponse(null, 'Device token removed');
  } catch {
    return serverErrorResponse();
  }
});
