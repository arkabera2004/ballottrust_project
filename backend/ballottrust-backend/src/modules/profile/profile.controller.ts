import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';

import { ProfileService } from './profile.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UpdateProfileDto } from './dto/update-profile.dto';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.profileService.getMyProfile(req.user.userId);
  }

  @Put('me')
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateMyProfile(req.user.userId, dto);
  }
}
