import { z } from 'zod';
export const studentIdParamSchema = z.object({ studentId: z.string().cuid() });