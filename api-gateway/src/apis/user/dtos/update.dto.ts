import { IProfile } from "src/interfaces/user.interface";

type UpdateProfile = Omit<IProfile, 'preferences'>;

export interface IUpdateProfile {
  profile: UpdateProfile;
}
export class UpdateProfileDto {
  userId?: string;
  profile: IUpdateProfile;
}
