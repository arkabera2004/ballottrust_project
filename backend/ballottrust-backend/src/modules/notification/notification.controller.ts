import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../../common/types';

import { QueryNotificationDto } from './dto';

import { ListNotificationsService } from './services/list-notifications.service';
import { UnreadCountService } from './services/unread-count.service';
import { MarkNotificationReadService } from './services/mark-notification-read.service';
import { MarkAllReadService } from './services/mark-all-read.service';
import { ArchiveNotificationService } from './services/archive-notification.service';
import { DeleteNotificationService } from './services/delete-notification.service';

/**
 * Every route is scoped to the signed-in user. There is deliberately no
 * "list notifications for user X" endpoint: notifications are personal,
 * and the audit log is the correct place to review what the system told
 * someone.
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly listNotificationsService: ListNotificationsService,

    private readonly unreadCountService: UnreadCountService,

    private readonly markNotificationReadService: MarkNotificationReadService,

    private readonly markAllReadService: MarkAllReadService,

    private readonly archiveNotificationService: ArchiveNotificationService,

    private readonly deleteNotificationService: DeleteNotificationService,
  ) {}

  // ======================================================
  // Unread Count
  // IMPORTANT: Must be declared before @Get(':id')-style routes
  // ======================================================

  @Get('unread-count')
  async unreadCount(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.unreadCountService.execute(user.userId);
  }

  // ======================================================
  // List My Notifications
  // ======================================================

  @Get()
  async findAll(
    @Query()
    query: QueryNotificationDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.listNotificationsService.execute(user.userId, query);
  }

  // ======================================================
  // Mark All Read
  // ======================================================

  @Patch('read-all')
  async markAllRead(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.markAllReadService.execute(user.userId);
  }

  // ======================================================
  // Mark One Read
  // ======================================================

  @Patch(':id/read')
  async markRead(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.markNotificationReadService.execute(id, user.userId);
  }

  // ======================================================
  // Archive
  // ======================================================

  @Patch(':id/archive')
  async archive(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.archiveNotificationService.execute(id, user.userId);
  }

  // ======================================================
  // Dismiss
  // ======================================================

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.deleteNotificationService.execute(id, user.userId);
  }
}
