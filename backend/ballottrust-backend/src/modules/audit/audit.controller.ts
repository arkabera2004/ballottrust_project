import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';

import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  // ======================================================
  // Verify Audit Chain Integrity
  // ======================================================

  @Get('verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.SUPER_ADMIN,
    Role.ELECTION_COMMISSIONER,
    Role.AUDITOR,
  )
  verify() {
    return this.auditService.verifyChain();
  }
}
