import { IUserRequest } from 'fakelingo-token';

export interface GoogleValidate extends IUserRequest {
  email: string;
}
