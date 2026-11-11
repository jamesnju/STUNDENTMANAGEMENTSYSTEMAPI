// modules/files/file.service.ts
import { FileCategory } from '@prisma/client';
import crypto from 'crypto';
import { cloudinary } from '../config/cloudinary';
import { prisma } from '../config/database';

const uploadBuffer = (buf: Buffer, folder: string) =>
  new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', use_filename: true, unique_filename: true },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buf);
  });

export const fileService = {
  async uploadOne(args: {
    buffer: Buffer; originalName: string; mimeType: string;
    category: FileCategory; uploadedById: string;
  }) {
    const folder = `school/${args.category.toLowerCase()}`;
    const result = await uploadBuffer(args.buffer, folder);
    return prisma.file.create({
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        resourceType: result.resource_type,
        format: result.format ?? null,
        bytes: result.bytes,
        originalName: args.originalName,
        mimeType: args.mimeType,
        category: args.category,
        uploadedById: args.uploadedById,
      },
    });
  },

  async delete(id: string) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return { id, deleted: false };
    await cloudinary.uploader.destroy(file.publicId, { resource_type: file.resourceType });
    await prisma.file.delete({ where: { id } });
    return { id, deleted: true };
  },

  /**
   * Signed upload for direct browser→Cloudinary upload (better on Vercel:
   * avoids large payloads passing through the serverless function).
   */
  signDirectUpload(args: { category: FileCategory; userId: string }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `school/${args.category.toLowerCase()}/${args.userId}`;
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, upload_preset: undefined },
      process.env.CLOUDINARY_API_SECRET!,
    );
    return { timestamp, folder, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME };
  },

  list: (args: { category?: FileCategory; uploadedById?: string; skip: number; take: number }) =>
    prisma.file.findMany({
      where: { category: args.category, uploadedById: args.uploadedById },
      orderBy: { createdAt: 'desc' },
      skip: args.skip,
      take: args.take,
    }),
};