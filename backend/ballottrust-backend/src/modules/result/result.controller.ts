import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { ResultService } from './result.service';

@Controller('results')
export class ResultController {
  constructor(
    private resultService: ResultService,
  ) {}

  @Get(':electionId')
  getResults(
    @Param('electionId')
    electionId: string,
  ) {
    return this.resultService.getResults(
      electionId,
    );
  }
}
