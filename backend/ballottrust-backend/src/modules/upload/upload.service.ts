import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    console.log('==============================');
    console.log('UPLOAD SERVICE');
    console.log('User ID:', userId);
    console.log('File:', file);
    console.log('==============================');

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

    console.log('User Found:', user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete previous avatar

    if (user.avatarUrl) {
      const oldPath = path.join(process.cwd(), user.avatarUrl.replace('/', ''));

      console.log('Old Avatar Path:', oldPath);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log('Old avatar deleted.');
      }
    }

    const avatarUrl = `/uploads/${file.filename}`;

    console.log('New Avatar URL:', avatarUrl);

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

    console.log('Database Updated Successfully');
    console.log(updatedUser);

    return {
      success: true,

      message: 'Avatar uploaded successfully',

      user: updatedUser,
    };
  }
}
