import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import type { Request } from 'express';

import { UploadService } from './upload.service';
import { multerConfig } from './upload.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.uploadService.uploadAvatar(req.user.userId, file);
  }
}
