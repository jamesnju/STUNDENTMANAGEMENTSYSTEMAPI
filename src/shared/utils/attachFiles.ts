import { prisma } from '../../config/database';
import { BadRequest } from './../errors/httpErrors';

type FileOwnerField = 'noteId' | 'assignmentId' | 'submissionId' | 'assessmentId';

/**
 * Attach the given File rows to a parent entity.
 *
 * - Only attaches files uploaded by `uploadedById` (security).
 * - Only attaches files that are not already linked to another parent.
 * - Returns the number actually linked. If it doesn't equal `fileIds.length`,
 *   throws so the caller can roll back — files were not all attributable.
 */
export async function attachFilesTo(
  fileIds: string[] | undefined,
  ownerField: FileOwnerField,
  ownerId: string,
  uploadedById: string,
): Promise<number> {
  if (!fileIds?.length) return 0;

  // Reject duplicates early so count validation is meaningful
  const uniqueIds = Array.from(new Set(fileIds));

  const result = await prisma.file.updateMany({
    where: {
      id: { in: uniqueIds },
      uploadedById,
      [ownerField]: null,
      // Require ALL owner FKs to be null — a file can only belong to one parent
      noteId: ownerField === 'noteId' ? undefined : null,
      assignmentId: ownerField === 'assignmentId' ? undefined : null,
      submissionId: ownerField === 'submissionId' ? undefined : null,
      assessmentId: ownerField === 'assessmentId' ? undefined : null,
    },
    data: { [ownerField]: ownerId } as never,
  });

  if (result.count !== uniqueIds.length) {
    throw BadRequest(
      `Only ${result.count} of ${uniqueIds.length} file(s) could be attached. ` +
        `Ensure each file was uploaded by you and is not already linked elsewhere.`,
    );
  }

  return result.count;
}

/**
 * Reverse of attachFilesTo — detach files from a parent.
 * Does not delete File rows (they can be re-used or cleaned up by the
 * `cleanupOrphanedFiles` job later).
 */
export async function detachFilesFrom(
  ownerField: FileOwnerField,
  ownerId: string,
  fileIds?: string[],
): Promise<number> {
  const result = await prisma.file.updateMany({
    where: {
      [ownerField]: ownerId,
      ...(fileIds?.length ? { id: { in: fileIds } } : {}),
    },
    data: { [ownerField]: null } as never,
  });
  return result.count;
}