import { BadRequest, Conflict, NotFound } from '../../shared/errors/httpErrors';
import { settingsRepository } from './settings.repository';

type CreateInput = {
  param: string;
  description?: string;
  valString?: string | null;
  valInt?: number | null;
  valBool?: boolean | null;
  valJson?: unknown;
};

type UpdateInput = {
  description?: string;
  valString?: string | null;
  valInt?: number | null;
  valBool?: boolean | null;
  valJson?: unknown;
};

/**
 * Ensures only one value column is populated at a time.
 * Returns the normalized payload for Prisma.
 */
function normalizeValue(input: CreateInput | UpdateInput) {
  const populated = [
    input.valString !== undefined && input.valString !== null ? 'valString' : null,
    input.valInt !== undefined && input.valInt !== null ? 'valInt' : null,
    input.valBool !== undefined && input.valBool !== null ? 'valBool' : null,
    input.valJson !== undefined && input.valJson !== null ? 'valJson' : null,
  ].filter(Boolean);

  if (populated.length > 1) {
    throw BadRequest('Only one value type may be set per setting');
  }
  return input;
}

export const settingsService = {
  async create(input: CreateInput) {
    normalizeValue(input);
    if (await settingsRepository.findByParam(input.param)) {
      throw Conflict('Setting param already exists');
    }
    return settingsRepository.create({
      param: input.param,
      description: input.description,
      valString: input.valString ?? null,
      valInt: input.valInt ?? null,
      valBool: input.valBool ?? null,
      valJson: (input.valJson ?? null) as never,
    });
  },

  async list(query: {
    skip: number;
    take: number;
    search?: string;
    sortBy?: string;
    sortDir: 'asc' | 'desc';
  }) {
    const [items, total] = await settingsRepository.list(query);
    return { items, total };
  },

  async getByParam(param: string) {
    const setting = await settingsRepository.findByParam(param);
    if (!setting) throw NotFound('Setting not found');
    return setting;
  },

  async update(param: string, input: UpdateInput) {
    const existing = await settingsRepository.findByParam(param);
    if (!existing) throw NotFound('Setting not found');

    normalizeValue(input);

    // If a value column is being set, null out the others so the row stays
    // consistent (matches the create-time "exactly one" invariant).
    const data: Record<string, unknown> = { ...input };
    if (
      input.valString !== undefined ||
      input.valInt !== undefined ||
      input.valBool !== undefined ||
      input.valJson !== undefined
    ) {
      const explicit = {
        valString: input.valString ?? null,
        valInt: input.valInt ?? null,
        valBool: input.valBool ?? null,
        valJson: input.valJson ?? null,
      };
      const setKey = Object.entries(explicit).find(([, v]) => v !== null)?.[0];
      if (setKey) {
        for (const key of ['valString', 'valInt', 'valBool', 'valJson']) {
          if (key !== setKey) data[key] = null;
        }
        data[setKey] = (explicit as Record<string, unknown>)[setKey];
      } else {
        // All values passed as null — clear the row's value
        data.valString = null;
        data.valInt = null;
        data.valBool = null;
        data.valJson = null;
      }
    }

    return settingsRepository.update(param, data as never);
  },

  async remove(param: string) {
    const existing = await settingsRepository.findByParam(param);
    if (!existing) throw NotFound('Setting not found');
    await settingsRepository.delete(param);
    return { param, deleted: true };
  },
};