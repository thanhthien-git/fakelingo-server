import { IProfile } from 'src/schemas/user-schema';

type UpdateProfile = Omit<IProfile, 'preferences'>;

export interface IUpdateProfile {
  profile: UpdateProfile;
}
export class UpdateProfileDto {
  userId?: string;
  profile: IUpdateProfile;
}
