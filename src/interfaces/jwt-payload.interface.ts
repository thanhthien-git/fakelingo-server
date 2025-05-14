import { JwtPayload } from 'jsonwebtoken';
import { ROLE } from '../enums/role.enum';

interface IUserBase {
  userId: string;
  userName: string;
  role: keyof typeof ROLE;
}

export interface TokenPayload extends JwtPayload, IUserBase {}

export interface IUserRequest extends IUserBase {}
