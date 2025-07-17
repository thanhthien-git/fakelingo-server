import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MatchDto } from './dto/match.dto';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
  constructor(private matchService: MatchService) {}

  @EventPattern('pong')
  async pong() {
    console.log('pong');
  }

  @EventPattern('match.create')
  async create(@Payload() matchPayload: MatchDto) {
    return await this.matchService.create(matchPayload);
  }
}
