import { Controller, Get, Query } from '@nestjs/common';

import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {
  constructor(private blockchainService: BlockchainService) {}

  @Get('verify')
  verify(@Query('electionId') electionId?: string) {
    return this.blockchainService.verifyChain(electionId);
  }
}
