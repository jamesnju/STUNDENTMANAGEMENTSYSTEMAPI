import { Conflict, NotFound, BadRequest } from '../../shared/errors/httpErrors';
import { prisma } from '../../config/database';
import { roomRepository } from './room.repository';

export const roomService = {
  async create(input: {
    name: string;
    code?: string;
    capacity?: number;
    building?: string;
    floor?: number;
    description?: string;
  }) {
    const [byName, byCode] = await Promise.all([
      roomRepository.findByName(input.name),
      input.code ? roomRepository.findByCode(input.code) : Promise.resolve(null),
    ]);
    if (byName) throw Conflict('Room name already exists');
    if (byCode) throw Conflict('Room code already exists');

    return roomRepository.create({
      name: input.name,
      code: input.code,
      capacity: input.capacity,
      building: input.building,
      floor: input.floor,
      description: input.description,
    });
  },

  async list(query: {
    skip: number;
    take: number;
    search?: string;
    building?: string;
    isActive?: boolean;
  }) {
    const [items, total] = await roomRepository.list(query);
    return { items, total };
  },

  async getById(id: string) {
    const room = await roomRepository.findById(id);
    if (!room) throw NotFound('Room not found');
    return room;
  },

  async update(
    id: string,
    input: {
      name?: string;
      code?: string | null;
      capacity?: number | null;
      building?: string | null;
      floor?: number | null;
      description?: string | null;
      isActive?: boolean;
    },
  ) {
    const room = await roomRepository.findById(id);
    if (!room) throw NotFound('Room not found');

    if (input.name && input.name !== room.name) {
      const dup = await roomRepository.findByName(input.name);
      if (dup) throw Conflict('Room name already exists');
    }
    if (input.code && input.code !== room.code) {
      const dup = await roomRepository.findByCode(input.code);
      if (dup) throw Conflict('Room code already exists');
    }

    return roomRepository.update(id, input);
  },

  async remove(id: string) {
    const room = await roomRepository.findById(id);
    if (!room) throw NotFound('Room not found');

    const activeSlots = await prisma.timetableSlot.count({
      where: { roomId: id },
    });
    if (activeSlots > 0) {
      throw BadRequest(
        `Cannot delete room: ${activeSlots} timetable slot(s) reference it. Reassign them first.`,
      );
    }

    await roomRepository.softDelete(id);
    return { id, isActive: false };
  },
};