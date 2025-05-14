import { IUserPreferences } from '../../../schemas/user-schema';

export class UpdatePreferencesDto {
  userId?: string;
  preferences: IUserPreferences;
}
