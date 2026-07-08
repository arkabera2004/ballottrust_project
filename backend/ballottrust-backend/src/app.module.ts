import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { UploadModule } from './upload/upload.module';

import { ElectionModule } from './election/election.module';
import { CandidateModule } from './candidate/candidate.module';
import { VoteModule } from './vote/vote.module';
import { ResultModule } from './result/result.module';

import { BlockchainModule } from './blockchain/blockchain.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CandidatePortalModule } from './candidate-portal/candidate-portal.module';

import { MailModule } from './mail/mail.module';

import { AdminController } from './admin.controller';

@Module({
  imports: [

    // Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Serve Uploaded Files
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    PrismaModule,

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

    CandidatePortalModule,

    MailModule,

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