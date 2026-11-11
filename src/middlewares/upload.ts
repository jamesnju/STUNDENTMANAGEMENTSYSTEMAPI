// middlewares/upload.ts
import multer from 'multer';
import { BadRequest } from '../shared/errors/httpErrors';

const ALLOWED = new Set([
  'image/png','image/jpeg','image/webp','image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]);

export const upload = (maxMb = 15) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED.has(file.mimetype)) return cb(BadRequest(`Unsupported file type: ${file.mimetype}`));
      cb(null, true);
    },
  });