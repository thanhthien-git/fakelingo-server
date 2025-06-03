import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum SwipeType {
  L = 'LEFT',
  R = 'RIGHT',
}

@Schema({ collection: 'swipes' })
export class Swipe {
  @Prop()
  _id?: Types.ObjectId;

  @Prop()
  sendFromId: Types.ObjectId;
  @Prop()
  targetUserId: Types.ObjectId;

  @Prop()
  type: SwipeType;
}

export type SwipeDocument = HydratedDocument<Swipe>;

export const SwipeSchema = SchemaFactory.createForClass(Swipe);

export interface ISwipe {
  _id?: Types.ObjectId;
  sendFromId: Types.ObjectId;
  targetUserId: Types.ObjectId;
  type: SwipeType;
}
