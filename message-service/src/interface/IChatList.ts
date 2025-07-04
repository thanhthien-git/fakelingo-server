import { IUser } from './IUser';

export interface IChatList {
  user: IUser;
  conversationId: string;
  lastMessageId: string;
  lastMessageContent: string;
}
