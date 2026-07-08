import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
} from '@nestjs/common';

import { ElectionService } from './election.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('elections')
export class ElectionController {
  constructor(
    private electionService: ElectionService,
  ) {}

  @Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
createElection(
  @Body() data: CreateElectionDto,
) {
  return this.electionService.createElection(data);
}

  @Get()
  getAllElections() {
    return this.electionService.getAllElections();
  }

  @Patch(':id/activate')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
  activateElection(
    @Param('id') id: string,
  ) {
    return this.electionService.activateElection(id);
  }

  @Patch(':id/close')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
  closeElection(
    @Param('id') id: string,
  ) {
    return this.electionService.closeElection(id);
  }
}
