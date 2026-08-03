import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
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
import { ResultModule } from './modules/result/result.module';

import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

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
    ResultModule,

    BlockchainModule,
    DashboardModule,


    MailModule,
    JobsModule,
  ],

  controllers: [
    AppController,
    AdminController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}