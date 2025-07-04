export class NotificationPayloadDto {
  userId: string;
  fromUserId?: string;
  type: NotificationType;
  title?: string;
  body?: string;
}

export type NotificationType = 'like' | 'match' | 'message';
