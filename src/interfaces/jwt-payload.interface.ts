import { JwtPayload } from 'jsonwebtoken';
import { ROLE } from 'src/enums/role.enum';

export interface TokenPayload extends JwtPayload {
  userId: string;
  userName: string;
  role: keyof typeof ROLE;
}
