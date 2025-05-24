import { ROLE } from '../enum/role.enum';

export interface ITokenPayload {
  userId: string;
  userName: string;
  role: keyof typeof ROLE;
}
