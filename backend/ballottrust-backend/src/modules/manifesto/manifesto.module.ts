import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

import { ManifestoController } from './manifesto.controller';

import { ManifestoRepository } from './repository/manifesto.repository';
import { ManifestoStatusValidator } from './validators/manifesto-status.validator';
import { ManifestoContentSanitizer } from './manifesto-content.sanitizer';

import { CreateManifestoService } from './services/create-manifesto.service';
import { UpdateManifestoService } from './services/update-manifesto.service';
import { SubmitManifestoService } from './services/submit-manifesto.service';
import { ApproveManifestoService } from './services/approve-manifesto.service';
import { RejectManifestoService } from './services/reject-manifesto.service';
import { GetManifestoService } from './services/get-manifesto.service';
import { ListManifestosService } from './services/list-manifestos.service';
import { GetCandidateManifestoService } from './services/get-candidate-manifesto.service';
import { ListManifestoVersionsService } from './services/list-manifesto-versions.service';
import { DeleteManifestoService } from './services/delete-manifesto.service';

@Module({
  imports: [PrismaModule, AuditModule],

  controllers: [ManifestoController],

  providers: [
    ManifestoRepository,
    ManifestoStatusValidator,
    ManifestoContentSanitizer,
    CreateManifestoService,
    UpdateManifestoService,
    SubmitManifestoService,
    ApproveManifestoService,
    RejectManifestoService,
    GetManifestoService,
    ListManifestosService,
    GetCandidateManifestoService,
    ListManifestoVersionsService,
    DeleteManifestoService,
  ],

  exports: [ManifestoRepository, GetCandidateManifestoService],
})
export class ManifestoModule {}
