import { IProfile } from '../schema/user-schema';

type UpdateProfile = Omit<IProfile, 'preferences'>;

export class UpdateProfileDto {
  userId?: string;
  profile: UpdateProfile;
}
