import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

const paramRegex = /^[a-z0-9_.]+$/i;

export const createSettingSchema = z
  .object({
    param: z
      .string()
      .min(2)
      .max(100)
      .regex(paramRegex, 'Param must be dot-namespaced, e.g. grading.pass_mark'),
    description: z.string().max(255).optional(),
    valString: z.string().nullable().optional(),
    valInt: z.number().int().nullable().optional(),
    valBool: z.boolean().nullable().optional(),
    valJson: z.unknown().nullable().optional(),
  })
  .refine(
    (d) =>
      [d.valString, d.valInt, d.valBool, d.valJson].filter((v) => v !== undefined && v !== null)
        .length === 1,
    { message: 'Exactly one of valString, valInt, valBool, valJson must be provided' },
  );

export const updateSettingSchema = z
  .object({
    description: z.string().max(255).optional(),
    valString: z.string().nullable().optional(),
    valInt: z.number().int().nullable().optional(),
    valBool: z.boolean().nullable().optional(),
    valJson: z.unknown().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

export const paramParamSchema = z.object({
  param: z.string().regex(paramRegex, 'Invalid param format'),
});

export const listSettingsSchema = paginationSchema.extend({
  search: z.string().optional(),
});