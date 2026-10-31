import { prisma } from '../../config/database';
import { NotFound } from '../errors/httpErrors';

export type SettingType = 'string' | 'int' | 'bool' | 'json';

/**
 * Read a setting value, optionally falling back to a default.
 * Caches the row per request only (no persistent cache yet — clear enough for
 * current scale; add an LRU or Redis layer later if the settings read becomes hot).
 */
export async function getSetting<T = unknown>(
  param: string,
  type: SettingType,
  defaultValue?: T,
): Promise<T> {
  const row = await prisma.appSetting.findUnique({ where: { param } });
  if (!row) {
    if (defaultValue !== undefined) return defaultValue;
    throw NotFound(`Setting not found: ${param}`);
  }

  switch (type) {
    case 'string':
      if (row.valString !== null) return row.valString as T;
      break;
    case 'int':
      if (row.valInt !== null) return row.valInt as T;
      break;
    case 'bool':
      if (row.valBool !== null) return row.valBool as T;
      break;
    case 'json':
      if (row.valJson !== null) return row.valJson as T;
      break;
  }

  if (defaultValue !== undefined) return defaultValue;
  throw NotFound(`Setting ${param} has no ${type} value`);
}

/** Convenience wrappers — keep call sites terse. */
export const getSettingString = (p: string, d?: string) =>
  getSetting<string>(p, 'string', d);
export const getSettingInt = (p: string, d?: number) =>
  getSetting<number>(p, 'int', d);
export const getSettingBool = (p: string, d?: boolean) =>
  getSetting<boolean>(p, 'bool', d);
export const getSettingJson = <T = unknown>(p: string, d?: T) =>
  getSetting<T>(p, 'json', d);