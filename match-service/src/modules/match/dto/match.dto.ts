import { IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class MatchDto {
  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  swiper: Types.ObjectId;

  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  target: Types.ObjectId;
}
