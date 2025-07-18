import { ApiProperty } from "@nestjs/swagger";

export interface ILocation {
  coordinates: [number, number];
}

export interface IFeedUser {
  gender?: string;
  location?: ILocation;
  interests?: string[];
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

export interface IUserPreferences {
  ageRange: { min: number; max: number };
  gender: string;
  max_distance: number;
}

