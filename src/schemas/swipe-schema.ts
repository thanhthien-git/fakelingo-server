import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

@Schema({ collection: 'swipes' })
export class Swipe {
  @Prop()
  _id?: ObjectId;

  @Prop()
  userId: ObjectId;

  @Prop()
  targetUserId: ObjectId;

  @Prop()
  type: 'left' | 'right';

  @Prop()
  createAt: Date;
}

export type SwipeDocument = HydratedDocument<Swipe>;

export const SwipeSchema = SchemaFactory.createForClass(Swipe);

export interface ISwipe {
  _id?: ObjectId;
  userId: ObjectId;
  targetUserId: ObjectId;
  type: 'left' | 'right';
  createAt: Date;
}
