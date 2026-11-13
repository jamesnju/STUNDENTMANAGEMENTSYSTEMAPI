import { z } from 'zod';
import { FileCategory } from '@prisma/client';
import { paginationSchema } from '../../shared/utils/pagination';

const categoryEnum = z.nativeEnum(FileCategory);

export const signUploadQuerySchema = z.object({
  category: categoryEnum.default('OTHER'),
});

export const uploadMultipartSchema = z.object({
  category: categoryEnum.default('OTHER'),
});

export const listFilesSchema = paginationSchema.extend({
  category: categoryEnum.optional(),
  uploadedById: z.string().cuid().optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });