import { ApiProperty } from "@nestjs/swagger";
import { IFeedUser } from "src/interfaces/user.interface";

export class FeedNewUserDto {
  @ApiProperty()
  condition: IFeedUser;
}
