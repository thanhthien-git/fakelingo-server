import { IUserPreferences } from 'src/schemas/user-schema';

export class UpdatePreferencesDto {
  userId?: string;
  preferences: IUserPreferences;
}
