import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ProfileService } from './profile.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get('me')
  async getMyProfile(@Req() req: any) {
    return this.profileService.getMyProfile(
      req.user.userId,
    );
  }

  @Put('me')
  async updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateMyProfile(
      req.user.userId,
      dto,
    );
  }
}
