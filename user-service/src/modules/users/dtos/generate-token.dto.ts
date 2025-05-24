import { ROLE } from '../../../enums/role.enum';

export class CreateTokenDto {
  userId: string;
  userName: string;
  role: keyof typeof ROLE;
}
