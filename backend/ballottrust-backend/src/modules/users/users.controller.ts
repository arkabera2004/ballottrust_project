import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ELECTION_COMMISSIONER')
  getPendingUsers() {
    return this.usersService.getPendingUsers();
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ELECTION_COMMISSIONER')
  approveUser(@Param('id') id: string) {
    return this.usersService.approveUser(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ELECTION_COMMISSIONER')
  rejectUser(@Param('id') id: string) {
    return this.usersService.rejectUser(id);
  }

  @Post('create-staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  createStaff(
    @Body()
    data: CreateStaffDto,
  ) {
    return this.usersService.createStaff(data);
  }
}
