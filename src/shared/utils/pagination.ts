import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export const buildPagination = (q: z.infer<typeof paginationSchema>) => {
  const skip = (q.page - 1) * q.limit;
  return { skip, take: q.limit, meta: { page: q.page, limit: q.limit } };
};