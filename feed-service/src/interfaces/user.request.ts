import { IUserRequest } from 'fakelingo-token';

export interface IUserReq extends IUserRequest {
  token: string;
}
