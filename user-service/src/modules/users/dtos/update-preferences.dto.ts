import { IUserPreferences } from '../schema/user-schema';

export class UpdatePreferencesDto {
  userId?: string;
  preferences: IUserPreferences;
}
