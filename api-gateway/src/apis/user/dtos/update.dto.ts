import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { IProfile } from 'src/interfaces/user.interface';

type UpdateProfile = Omit<IProfile, 'preferences'>;

export class UpdateProfileDto {
  @IsOptional()
  userId?: string;

  @ValidateNested()
  @Type(() => Object)
  profile: UpdateProfile;
}
