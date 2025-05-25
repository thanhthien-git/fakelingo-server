import { IUserPreferences } from "src/interfaces/user.interface";

export class UpdatePreferencesDto {
  userId?: string;
  preferences: IUserPreferences;
}
