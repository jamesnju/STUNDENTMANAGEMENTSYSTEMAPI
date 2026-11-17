import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';
export const myAssignmentsQuerySchema = paginationSchema.extend({
  status: z.enum(['PUBLISHED', 'CLOSED']).optional(),
});