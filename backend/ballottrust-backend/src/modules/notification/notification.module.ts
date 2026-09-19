import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

import { NotificationController } from './notification.controller';
import { NotificationListener } from './notification.listener';

import { NotificationRepository } from './repository/notification.repository';

import { CreateNotificationService } from './services/create-notification.service';
import { ListNotificationsService } from './services/list-notifications.service';
import { UnreadCountService } from './services/unread-count.service';
import { MarkNotificationReadService } from './services/mark-notification-read.service';
import { MarkAllReadService } from './services/mark-all-read.service';
import { ArchiveNotificationService } from './services/archive-notification.service';
import { DeleteNotificationService } from './services/delete-notification.service';

@Module({
  imports: [PrismaModule, MailModule],

  controllers: [NotificationController],

  providers: [
    NotificationRepository,
    NotificationListener,
    CreateNotificationService,
    ListNotificationsService,
    UnreadCountService,
    MarkNotificationReadService,
    MarkAllReadService,
    ArchiveNotificationService,
    DeleteNotificationService,
  ],

  exports: [CreateNotificationService],
})
export class NotificationModule {}
