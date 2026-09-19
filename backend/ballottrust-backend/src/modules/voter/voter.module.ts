import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

import { VoterController } from './voter.controller';

import { VoterRegistrationRepository } from './repository/voter-registration.repository';

import { VoterRegistrationStatusValidator } from './validators/voter-registration-status.validator';
import { RegistrationWindowValidator } from './validators/registration-window.validator';

import { RegisterVoterService } from './services/register-voter.service';
import { CreateVoterRegistrationService } from './services/create-voter-registration.service';
import { VerifyVoterService } from './services/verify-voter.service';
import { ApproveVoterService } from './services/approve-voter.service';
import { RejectVoterService } from './services/reject-voter.service';
import { GetVoterRegistrationService } from './services/get-voter-registration.service';
import { ListVotersService } from './services/list-voters.service';
import { MyVoterRegistrationsService } from './services/my-voter-registrations.service';
import { UpdateVoterRegistrationService } from './services/update-voter-registration.service';
import { DeleteVoterRegistrationService } from './services/delete-voter-registration.service';
import { ImportVotersService } from './services/import-voters.service';
import { ExportVotersService } from './services/export-voters.service';
import { VoterRollStatsService } from './services/voter-roll-stats.service';
import { CheckVoterRollService } from './services/check-voter-roll.service';

@Module({
  imports: [PrismaModule, AuditModule],

  controllers: [VoterController],

  providers: [
    VoterRegistrationRepository,
    VoterRegistrationStatusValidator,
    RegistrationWindowValidator,
    RegisterVoterService,
    CreateVoterRegistrationService,
    VerifyVoterService,
    ApproveVoterService,
    RejectVoterService,
    GetVoterRegistrationService,
    ListVotersService,
    MyVoterRegistrationsService,
    UpdateVoterRegistrationService,
    DeleteVoterRegistrationService,
    ImportVotersService,
    ExportVotersService,
    VoterRollStatsService,
    CheckVoterRollService,
  ],

  exports: [
    VoterRegistrationRepository,
    RegistrationWindowValidator,
    CheckVoterRollService,
  ],
})
export class VoterModule {}
