import { getMessaging } from './admin';
import type { Message, MulticastMessage } from 'firebase-admin/messaging';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export async function sendPushNotification(token: string, payload: PushPayload): Promise<string> {
  const message: Message = {
    token,
    notification: { title: payload.title, body: payload.body, imageUrl: payload.imageUrl },
    data: payload.data,
    android: { priority: 'high', notification: { sound: 'default', channelId: 'debtpilot_alerts' } },
    apns: { payload: { aps: { sound: 'default', badge: 1 } } },
  };
  return getMessaging().send(message);
}

export async function sendMulticastPush(
  tokens: string[],
  payload: PushPayload,
): Promise<{ successCount: number; failureCount: number; failedTokens: string[] }> {
  if (tokens.length === 0) return { successCount: 0, failureCount: 0, failedTokens: [] };

  const message: MulticastMessage = {
    tokens,
    notification: { title: payload.title, body: payload.body },
    data: payload.data,
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  };

  const response = await getMessaging().sendEachForMulticast(message);
  const failedTokens: string[] = [];
  response.responses.forEach((resp, idx) => {
    if (!resp.success) failedTokens.push(tokens[idx]);
  });

  return { successCount: response.successCount, failureCount: response.failureCount, failedTokens };
}

export async function subscribeToTopic(tokens: string[], topic: string): Promise<void> {
  await getMessaging().subscribeToTopic(tokens, topic);
}

export async function sendToTopic(topic: string, payload: PushPayload): Promise<string> {
  return getMessaging().send({
    topic,
    notification: { title: payload.title, body: payload.body },
    data: payload.data,
  });
}
