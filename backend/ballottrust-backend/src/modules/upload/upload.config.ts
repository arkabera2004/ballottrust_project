import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',

    filename: (
      _req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      callback(null, `${uniqueName}${extname(file.originalname)}`);
    },
  }),

  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/i)) {
      return callback(new Error('Only image files are allowed'), false);
    }

    callback(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
