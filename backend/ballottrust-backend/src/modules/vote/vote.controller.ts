import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('votes')
export class VoteController {
  constructor(private voteService: VoteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  castVote(@Req() req: AuthenticatedRequest, @Body() data: CreateVoteDto) {
    return this.voteService.castVote(req.user.userId, data);
  }
}
