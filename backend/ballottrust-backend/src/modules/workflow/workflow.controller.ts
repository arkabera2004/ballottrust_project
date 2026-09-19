import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../../common/types';

import {
  CompleteTaskDto,
  CreateCommentDto,
  CreateTaskDto,
  EscalateTaskDto,
  QueryTaskDto,
  UpdateTaskDto,
} from './dto';

import { CreateTaskService } from './services/create-task.service';
import { ListTasksService } from './services/list-tasks.service';
import { GetTaskService } from './services/get-task.service';
import { UpdateTaskService } from './services/update-task.service';
import { StartTaskService } from './services/start-task.service';
import { CompleteTaskService } from './services/complete-task.service';
import { EscalateTaskService } from './services/escalate-task.service';
import { CancelTaskService } from './services/cancel-task.service';
import { CommentOnTaskService } from './services/comment-on-task.service';
import { ListTaskCommentsService } from './services/list-task-comments.service';

/** Roles that may assign, reassign, escalate or cancel work. */
const TASK_ADMIN_ROLES = [
  Role.SUPER_ADMIN,
  Role.ELECTION_COMMISSIONER,
] as const;

const ADMIN_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ELECTION_COMMISSIONER];

const isAdmin = (user: AuthenticatedUser) => ADMIN_ROLES.includes(user.role);

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  constructor(
    private readonly createTaskService: CreateTaskService,

    private readonly listTasksService: ListTasksService,

    private readonly getTaskService: GetTaskService,

    private readonly updateTaskService: UpdateTaskService,

    private readonly startTaskService: StartTaskService,

    private readonly completeTaskService: CompleteTaskService,

    private readonly escalateTaskService: EscalateTaskService,

    private readonly cancelTaskService: CancelTaskService,

    private readonly commentOnTaskService: CommentOnTaskService,

    private readonly listTaskCommentsService: ListTaskCommentsService,
  ) {}

  // ======================================================
  // My Task Queue
  // IMPORTANT: Must be declared before @Get(':id')
  // ======================================================

  @Get('me')
  async myTasks(
    @Query()
    query: QueryTaskDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.listTasksService.execute(query, user.userId);
  }

  // ======================================================
  // List All Tasks
  // ======================================================

  @Get()
  @UseGuards(RolesGuard)
  @Roles(...TASK_ADMIN_ROLES)
  async findAll(
    @Query()
    query: QueryTaskDto,
  ) {
    return this.listTasksService.execute(query);
  }

  // ======================================================
  // Assign Task
  // ======================================================

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...TASK_ADMIN_ROLES)
  async create(
    @Body()
    dto: CreateTaskDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.createTaskService.execute(dto, user.userId);
  }

  // ======================================================
  // Get Task
  // ======================================================

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.getTaskService.execute(id);
  }

  // ======================================================
  // Update Task
  // ======================================================

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...TASK_ADMIN_ROLES)
  async update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateTaskDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.updateTaskService.execute(id, dto, user.userId);
  }

  // ======================================================
  // Start Task
  // ======================================================

  @Patch(':id/start')
  async start(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.startTaskService.execute(id, user.userId, isAdmin(user));
  }

  // ======================================================
  // Complete Task
  // ======================================================

  @Patch(':id/complete')
  async complete(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: CompleteTaskDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.completeTaskService.execute(
      id,
      user.userId,
      dto,
      isAdmin(user),
    );
  }

  // ======================================================
  // Escalate Task
  // ======================================================

  @Patch(':id/escalate')
  @UseGuards(RolesGuard)
  @Roles(...TASK_ADMIN_ROLES)
  async escalate(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: EscalateTaskDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.escalateTaskService.execute(id, user.userId, dto);
  }

  // ======================================================
  // Cancel Task
  // ======================================================

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...TASK_ADMIN_ROLES)
  async cancel(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.cancelTaskService.execute(id, user.userId);
  }

  // ======================================================
  // Comments
  // ======================================================

  @Get(':id/comments')
  async comments(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.listTaskCommentsService.execute(id);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: CreateCommentDto,

    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.commentOnTaskService.execute(id, user.userId, dto);
  }
}
