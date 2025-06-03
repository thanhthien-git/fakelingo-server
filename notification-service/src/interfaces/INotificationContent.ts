export class INotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  createdAt?: string;
}

export type NotificationType = 'match' | 'message' | 'like' | 'system';
