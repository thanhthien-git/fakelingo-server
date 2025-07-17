import { BadRequestException, Injectable } from '@nestjs/common';
import { MatchDto } from './dto/match.dto';
import { Match } from 'src/models/match/match.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MatchService {
  constructor(@InjectModel(Match.name) private matchDocument: Model<Match>) {}
  async create(matchPayload: MatchDto) {
    try {
      await this.matchDocument.create({
        matchedAt: new Date(),
        swiper: matchPayload.swiper,
        target: matchPayload.target,
      });
    } catch (err) {
      console.error(err);
      throw new BadRequestException({ message: err });
    }
  }
}
