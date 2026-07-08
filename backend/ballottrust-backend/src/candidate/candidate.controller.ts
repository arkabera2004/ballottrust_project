import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';

import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('candidates')
export class CandidateController {
  constructor(
    private candidateService: CandidateService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() data: CreateCandidateDto) {
    return this.candidateService.create(data);
  }

  @Get()
  findAll() {
    return this.candidateService.findAll();
  }

  @Get('pending')
getPendingCandidates() {
  return this.candidateService.getPendingCandidates();
}

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  approve(
    @Param('id') id: string,
  ) {
    return this.candidateService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  reject(
    @Param('id') id: string,
  ) {
    return this.candidateService.reject(id);
  }

  
}