import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';

// ===============================
// Modules
// ===============================

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfileModule } from './modules/profile/profile.module';
import { UploadModule } from './modules/upload/upload.module';

import { ElectionModule } from './modules/election/election.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { VoteModule } from './modules/vote/vote.module';
import { VoterModule } from './modules/voter/voter.module';
import { ManifestoModule } from './modules/manifesto/manifesto.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SystemConfigModule } from './modules/config/config.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { PublicModule } from './modules/public/public.module';
import { ReportModule } from './modules/report/report.module';
import { ResultModule } from './modules/result/result.module';

import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';
import { EligibilityModule } from './modules/eligibility/eligibility.module';

import { MailModule } from './modules/mail/mail.module';

import { AdminController } from './admin.controller';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    // =====================================
    // Global Configuration
    // =====================================

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Global fallback limit. Sensitive auth/OTP endpoints apply a
    // tighter, named limit via @Throttle() — see auth.controller.ts.
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    // Lets modules raise notifications without importing the
    // NotificationModule — see notification.events.ts.
    EventEmitterModule.forRoot(),

    // =====================================
    // Static File Hosting
    // =====================================

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    // =====================================
    // Core
    // =====================================

    PrismaModule,

    // =====================================
    // Feature Modules
    // =====================================

    AuthModule,
    UsersModule,
    ProfileModule,
    UploadModule,

    ElectionModule,
    CandidateModule,
    VoteModule,
    VoterModule,
    ManifestoModule,
    NotificationModule,
    SystemConfigModule,
    WorkflowModule,
    PublicModule,
    ReportModule,
    ResultModule,

    BlockchainModule,
    DashboardModule,
    AuditModule,
    EligibilityModule,

    MailModule,
    JobsModule,
  ],

  controllers: [AppController, AdminController],

  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
