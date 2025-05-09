import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ROLE } from 'src/enums/role.enum';

@Schema({ collection: 'users' })
export class User {
  @Prop()
  _id?: Types.ObjectId;

  @Prop()
  email: string;

  @Prop()
  userName: string;

  @Prop()
  password: string;

  @Prop()
  role: string;

  @Prop()
  currentLevel: string;

  @Prop()
  createAt: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

export interface IUser {
  _id: Types.ObjectId;
  userName: string;
  password: string;
  email: string;
  role: keyof typeof ROLE;
  currentLevel: string;
  createAt: Date;
}
