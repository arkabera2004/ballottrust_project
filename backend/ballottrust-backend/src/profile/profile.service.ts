import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { userProfileSelect } from './constants/profile-select';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getMyProfile(userId: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: userProfileSelect,
      });

    if (!user) {
      throw new NotFoundException(
        'Profile not found',
      );
    }

    return user;
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateProfileDto,
  ) {

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!existingUser) {
      throw new NotFoundException(
        'Profile not found',
      );
    }

    const updatedUser =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          ...dto,

          profileCompleted: true,
        },

        select: userProfileSelect,
      });

    return {
      message:
        'Profile updated successfully',

      profile: updatedUser,
    };
  }
}