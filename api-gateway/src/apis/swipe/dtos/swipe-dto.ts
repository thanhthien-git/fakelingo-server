import { Types } from 'mongoose';
import { Transform } from 'class-transformer';

export class SwipeDto {
  @Transform(({ value }) => new Types.ObjectId(value), { toClassOnly: true })
  targetUserId: Types.ObjectId;

  type: SwipeType;
}

export enum SwipeType {
  L = 'LEFT',
  R = 'RIGHT',
}

export class SwipePayloadDto {
  type: string;
  sendFromUser: string;
  targetUser: string;
}
