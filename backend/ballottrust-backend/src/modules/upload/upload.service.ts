import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly prisma: PrismaService) {}

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!userId) {
      throw new BadRequestException('User ID is missing');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete previous avatar

    if (user.avatarUrl) {
      const oldPath = path.join(process.cwd(), user.avatarUrl.replace('/', ''));

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        this.logger.debug(`Deleted previous avatar for user ${userId}`);
      }
    }

    const avatarUrl = `/uploads/${file.filename}`;

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        avatarUrl,
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
        emailVerified: true,
        profileCompleted: true,
      },
    });

    this.logger.log(`Avatar updated for user ${userId}`);

    return {
      success: true,

      message: 'Avatar uploaded successfully',

      user: updatedUser,
    };
  }
}
