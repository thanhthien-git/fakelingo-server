import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Message } from './message.schema';

@Schema({ timestamps: true, collection: 'conversations' })
export class Conversation extends Document {
  @Prop({ type: [Types.ObjectId], required: true })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: Message.name })
  lastMessageId?: Types.ObjectId;

  @Prop({ type: Date })
  lastMessageAt?: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
