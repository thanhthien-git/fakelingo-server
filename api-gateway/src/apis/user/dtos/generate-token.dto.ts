import { ROLE } from "fakelingo-token";

export class CreateTokenDto {
  userId: string;
  userName: string;
  role: keyof typeof ROLE;
}
