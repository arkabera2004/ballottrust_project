import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const candidateDocumentMulterConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',

    filename: (
      _req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      callback(
        null,
        `${uniqueName}${extname(file.originalname).toLowerCase()}`,
      );
    },
  }),

  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Only PDF, JPG, JPEG, PNG and WEBP files are allowed.',
        ),
        false,
      );
    }

    callback(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
