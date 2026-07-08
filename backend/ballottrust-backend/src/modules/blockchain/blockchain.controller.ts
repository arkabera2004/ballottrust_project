import {
  Controller,
  Get,
} from '@nestjs/common';

import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {
  constructor(
    private blockchainService: BlockchainService,
  ) {}

  @Get('verify')
  verify() {
    return this.blockchainService.verifyChain();
  }
}
