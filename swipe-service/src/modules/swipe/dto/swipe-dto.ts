import { Types } from 'mongoose';
import { SwipeType } from 'src/schema/swipe.schema';
import { Transform } from 'class-transformer';

export class SwipeDto {
  @Transform(({ value }) => new Types.ObjectId(value), { toClassOnly: true })
  targetUserId: Types.ObjectId;

  type: SwipeType;
}

export class SwipePayloadDto {
  type: string;
  sendFromUser: string;
  targetUser: string;
}
