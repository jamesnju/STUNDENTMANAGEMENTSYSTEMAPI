import { FileCategory } from '@prisma/client';
import { cloudinary } from '../../config/cloudinary';
import { env } from '../../config/env';
import { Forbidden, NotFound } from '../../shared/errors/httpErrors';
import { fileRepository } from './file.repository';
import { CLOUDINARY_FOLDER } from './file.constants';

type AuthCtx = { userId: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' };

const uploadBuffer = (
  buffer: Buffer,
  folder: string,
  originalName: string,
): Promise<{
  public_id: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  bytes: number;
}> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
        filename_override: originalName,
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
        resolve(result as never);
      },
    );
    stream.end(buffer);
  });

export const fileService = {
  async uploadOne(args: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    category: FileCategory;
    userId: string;
  }) {
    const folder = `${CLOUDINARY_FOLDER[args.category]}/${args.userId}`;
    const result = await uploadBuffer(args.buffer, folder, args.originalName);

    return fileRepository.create({
      publicId: result.public_id,
      url: result.secure_url,
      resourceType: result.resource_type,
      format: result.format ?? null,
      bytes: result.bytes,
      originalName: args.originalName,
      mimeType: args.mimeType,
      category: args.category,
      uploadedBy: { connect: { id: args.userId } },
    });
  },

  /**
   * Signed direct upload params for browser → Cloudinary uploads.
   * Client sends bytes straight to Cloudinary; only metadata comes back to us.
   */
  signDirectUpload(args: { category: FileCategory; userId: string }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `${CLOUDINARY_FOLDER[args.category]}/${args.userId}`;

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      env.CLOUDINARY_API_SECRET,
    );

    return {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
      // Client POSTs to:
      uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    };
  },

  async list(query: {
    skip: number;
    take: number;
    category?: FileCategory;
    uploadedById?: string;
  }) {
    const [items, total] = await fileRepository.list(query);
    return { items, total };
  },

  async getById(id: string) {
    const file = await fileRepository.findById(id);
    if (!file) throw NotFound('File not found');
    return file;
  },

  async remove(id: string, ctx: AuthCtx) {
    const file = await fileRepository.findById(id);
    if (!file) throw NotFound('File not found');

    if (ctx.role !== 'ADMIN' && file.uploadedById !== ctx.userId) {
      throw Forbidden('You can only delete your own files');
    }

    // Destroy in Cloudinary; if it 404s we still delete the row
    try {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.resourceType,
        invalidate: true,
      });
    } catch {
      /* best effort */
    }

    await fileRepository.delete(id);
    return { id, deleted: true };
  },
};