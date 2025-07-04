import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'messages' })
export class Message extends Document {
  @Prop({ required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  receiverId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ required: true })
  conversationId: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
