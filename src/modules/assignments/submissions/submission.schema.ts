import { z } from 'zod';
import { paginationSchema } from '../../../shared/utils/pagination';

export const submitAssignmentSchema = z.object({
  content: z.string().max(10_000).optional(),
  fileIds: z.array(z.string().cuid()).max(20).optional(),
});

export const gradeSubmissionSchema = z.object({
  grade: z.number().min(0),
  feedback: z.string().max(5000).optional(),
});

export const listSubmissionsSchema = paginationSchema.extend({
  status: z.enum(['ungraded', 'graded']).optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });
export const assignmentIdParamSchema = z.object({ assignmentId: z.string().cuid() });