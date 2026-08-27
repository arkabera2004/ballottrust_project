import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  BadRequestException,
} from '@nestjs/common';

export const candidateDocumentMulterConfig = {
  storage: diskStorage({
    destination: './uploads',

    filename: (_, file, callback) => {
      const uniqueName =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9,
        )}`;

      callback(
        null,
        `${uniqueName}${extname(
          file.originalname,
        ).toLowerCase()}`,
      );
    },
  }),

  fileFilter: (_, file, callback) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (
      !allowedMimeTypes.includes(
        file.mimetype,
      )
    ) {
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