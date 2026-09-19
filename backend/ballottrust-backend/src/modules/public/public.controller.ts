import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { QueryPublicCandidateDto, QueryPublicElectionDto } from './dto';

import { ListPublicElectionsService } from './services/list-public-elections.service';
import { GetPublicElectionService } from './services/get-public-election.service';
import { ListPublicCandidatesService } from './services/list-public-candidates.service';
import { GetPublicCandidateService } from './services/get-public-candidate.service';
import { GetPublicResultsService } from './services/get-public-results.service';
import { GetPublicStatisticsService } from './services/get-public-statistics.service';
import { VerifyReceiptService } from './services/verify-receipt.service';

/**
 * The Public Election Portal (docs/07 §17).
 *
 * Every route here is deliberately unauthenticated — "No authentication
 * required for public data". There is no guard on this controller, so
 * each service is responsible for filtering to published content; the
 * shared rules live in public-visibility.ts.
 */
@Controller('public')
export class PublicController {
  constructor(
    private readonly listPublicElectionsService: ListPublicElectionsService,

    private readonly getPublicElectionService: GetPublicElectionService,

    private readonly listPublicCandidatesService: ListPublicCandidatesService,

    private readonly getPublicCandidateService: GetPublicCandidateService,

    private readonly getPublicResultsService: GetPublicResultsService,

    private readonly getPublicStatisticsService: GetPublicStatisticsService,

    private readonly verifyReceiptService: VerifyReceiptService,
  ) {}

  // ======================================================
  // Elections
  // ======================================================

  @Get('elections')
  async elections(
    @Query()
    query: QueryPublicElectionDto,
  ) {
    return this.listPublicElectionsService.execute(query);
  }

  /** Accepts either a UUID or a human-friendly election code. */
  @Get('elections/:idOrCode')
  async election(
    @Param('idOrCode')
    idOrCode: string,
  ) {
    return this.getPublicElectionService.execute(idOrCode);
  }

  // ======================================================
  // Candidates
  // ======================================================

  @Get('candidates')
  async candidates(
    @Query()
    query: QueryPublicCandidateDto,
  ) {
    return this.listPublicCandidatesService.execute(query);
  }

  @Get('candidates/:id')
  async candidate(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.getPublicCandidateService.execute(id);
  }

  // ======================================================
  // Results
  // ======================================================

  @Get('results/:electionId')
  async results(
    @Param('electionId', ParseUUIDPipe)
    electionId: string,
  ) {
    return this.getPublicResultsService.execute(electionId);
  }

  // ======================================================
  // Statistics
  // ======================================================

  @Get('statistics')
  async statistics() {
    return this.getPublicStatisticsService.execute();
  }

  // ======================================================
  // Vote Receipt Verification
  // ======================================================

  @Get('verify/:code')
  async verify(
    @Param('code')
    code: string,
  ) {
    return this.verifyReceiptService.execute(code);
  }
}
