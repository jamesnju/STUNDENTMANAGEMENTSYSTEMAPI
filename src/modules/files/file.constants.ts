import { FileCategory } from '@prisma/client';

/** Public folders per category — Cloudinary namespace. */
export const CLOUDINARY_FOLDER: Record<FileCategory, string> = {
  NOTE: 'school/notes',
  ASSIGNMENT_ATTACHMENT: 'school/assignments',
  SUBMISSION_ATTACHMENT: 'school/submissions',
  EXAM_PAPER: 'school/exams',
  PROFILE_IMAGE: 'school/avatars',
  OTHER: 'school/misc',
};