import { Types } from 'mongoose';
import { ISwipe, SwipeType } from 'src/schema/swipe.schema';

export class SwipeDto implements ISwipe {
  _id?: Types.ObjectId;
  targetUserId: Types.ObjectId;
  type: SwipeType;
}
