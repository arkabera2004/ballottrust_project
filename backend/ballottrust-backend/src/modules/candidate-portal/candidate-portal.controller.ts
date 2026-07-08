import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CandidatePortalService }
  from './candidate-portal.service';

import { CreateNominationDto }
  from './dto/create-nomination.dto';

@Controller('candidate-portal')
export class CandidatePortalController {
  constructor(
    private readonly service:
      CandidatePortalService,
  ) {}

@Post('nomination')
submitNomination(
  @Body() data: any,
) {
  console.log('BODY RECEIVED =>');
  console.log(data);

  return this.service.submitNomination(data);
}

  @Get()
  getAllCandidates() {
    return this.service
      .getAllCandidates();
  }

  @Patch('approve/:id')
  approve(
    @Param('id')
    id: string,
  ) {
    return this.service
      .approveCandidate(id);
  }

  @Patch('reject/:id')
  reject(
    @Param('id')
    id: string,

    @Body('reason')
    reason: string,
  ) {
    return this.service
      .rejectCandidate(
        id,
        reason,
      );
  }
}
