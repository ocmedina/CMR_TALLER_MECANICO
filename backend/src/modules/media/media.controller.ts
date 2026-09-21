import { Request, Response, NextFunction } from 'express';
import { MediaType } from '@prisma/client';
import { MediaService } from './media.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const mediaService = new MediaService();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('file');

export class MediaController {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workOrderId, caption, type, directUrl } = req.body;

      if (!workOrderId) {
        res.status(400).json({ success: false, message: 'workOrderId es requerido' });
        return;
      }

      let fileUrl = directUrl;
      if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
      }

      if (!fileUrl) {
        res.status(400).json({ success: false, message: 'Debe adjuntar un archivo o directUrl' });
        return;
      }

      const mediaType = (type && Object.values(MediaType).includes(type)) ? type : MediaType.DISASSEMBLY;

      const mediaRecord = await mediaService.saveMedia({
        workOrderId,
        url: fileUrl,
        type: mediaType,
        caption,
      });

      res.status(201).json({
        success: true,
        message: 'Evidencia multimedia subida exitosamente',
        data: mediaRecord,
      });
    } catch (error) {
      next(error);
    }
  }
}
