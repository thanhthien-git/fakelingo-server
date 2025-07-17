import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'matches' })
export class Match extends Document {
  @Prop({ required: true })
  swiper: Types.ObjectId;

  @Prop({ required: true })
  target: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  matchedAt: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
