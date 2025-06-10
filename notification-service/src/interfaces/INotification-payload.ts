export class NotificationPayloadDto {
  userId: string;
  fromUserId?: string;
  type: NotificationType;
  title?: string;
  body?: string;
  fcmToken: string;
}

export type NotificationType = 'like' | 'match' | 'message';
