import { Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ROLE } from 'src/enums/role.enum';

class Location {
  @Prop([Number])
  coordinates: [number, number];
}

class UserPreferences {
  @Prop({ type: [Number, Number] })
  ageRange: { min: number; max: number };

  @Prop()
  gender: string;

  @Prop()
  max_distance: number;
}

class Profile {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop()
  bio: string;

  @Prop([String])
  photos: string[];

  @Prop({ type: () => Location })
  location: Location;

  @Prop([String])
  interests: string[];

  @Prop({ type: () => UserPreferences })
  preferences: UserPreferences;
}

@Schema({ collection: 'users' })
export class User {
  @Field(() => ID)
  @Prop()
  _id?: Types.ObjectId;

  @Field()
  @Prop({ unique: true })
  email: string;

  @Field()
  @Prop({ unique: true })
  userName: string;

  @Prop({ select: false })
  password: string;

  @Prop({ select: false })
  fcmToken?: string;

  @Field()
  @Prop({ type: String })
  role: keyof typeof ROLE;

  @Prop()
  createAt: Date;

  @Prop()
  lastActive: Date;

  @Field()
  @Prop({ type: () => Profile })
  profile: Profile;

  @Field()
  @Prop({ type: String })
  googleId?: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

export interface ILocation {
  coordinates: [number, number];
}

export interface IUserPreferences {
  ageRange: { min: number; max: number };
  gender: string;
  max_distance: number;
}

export interface IProfile {
  name?: string;
  age?: number;
  gender?: string;
  bio?: string;
  photos?: string[];
  location?: ILocation;
  interests?: string[];
  preferences?: IUserPreferences;
}

export interface IUser {
  _id: Types.ObjectId;
  userName: string;
  password: string;
  email: string;
  role: keyof typeof ROLE;
  createAt: Date;
  lastActive?: Date;
  googleId?: string;
  profile?: IProfile;
}

export type IFeedUser = Omit<IProfile, 'name' | 'bio' | 'photos'>;

export type IUserResponse = Omit<IUser, 'password' | 'role' | 'createAt'>;
