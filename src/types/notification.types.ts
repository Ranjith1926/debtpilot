export type NotificationType = 'due_soon' | 'overdue' | 'payment_success' | 'payment_failed' | 'insight' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  loanId?: string;
  amount?: number;
  dueDate?: string;
  isRead: boolean;
  createdAt: string;
  actionRoute?: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  dueSoonDays: number[];
  overdueAlerts: boolean;
  paymentAlerts: boolean;
  insightAlerts: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}
