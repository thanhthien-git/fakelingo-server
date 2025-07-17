import { IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class MatchDto {
  swiper: string;
  target: string;
}
