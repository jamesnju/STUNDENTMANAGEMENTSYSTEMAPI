import { prisma } from '../../config/database';
import { verifyPassword } from '../../shared/utils/password';
import { signAccess, signRefresh, verifyRefresh } from '../../shared/utils/jwt';
import { Unauthorized } from '../../shared/errors/httpErrors';
import { env } from '../../config/env';
import crypto from 'crypto';

const hashToken = (t: string) => crypto.createHash('sha256').update(t).digest('hex');

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teacherProfile: { select: { departmentId: true } },
        studentProfile: { select: { departmentId: true } },
      },
    });
    if (!user || !user.isActive || user.deletedAt) throw Unauthorized('Invalid credentials');
    if (!(await verifyPassword(password, user.passwordHash))) throw Unauthorized('Invalid credentials');

    const departmentId =
      user.teacherProfile?.departmentId ?? user.studentProfile?.departmentId ?? undefined;

    const accessToken = signAccess({
      id: user.id,
      role: user.role,
      departmentId,
      tokenVersion: user.tokenVersion,
    });

    const jti = crypto.randomUUID();
    const refreshToken = signRefresh(user.id, jti);
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400_000);

    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: hashToken(jti), expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, departmentId },
    };
  },

  async refresh(refreshToken: string) {
    const payload = verifyRefresh(refreshToken);
    const record = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(payload.jti) },
    });
    if (!record || record.revokedAt || record.expiresAt < new Date())
      throw Unauthorized('Refresh token invalid');

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        teacherProfile: { select: { departmentId: true } },
        studentProfile: { select: { departmentId: true } },
      },
    });
    if (!user || !user.isActive) throw Unauthorized();

    const departmentId =
      user.teacherProfile?.departmentId ?? user.studentProfile?.departmentId ?? undefined;
    return {
      accessToken: signAccess({
        id: user.id,
        role: user.role,
        departmentId,
        tokenVersion: user.tokenVersion,
      }),
    };
  },

  async logout(refreshToken: string) {
    try {
      const payload = verifyRefresh(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(payload.jti) },
        data: { revokedAt: new Date() },
      });
    } catch {
      /* ignore invalid token on logout */
    }
  },
};