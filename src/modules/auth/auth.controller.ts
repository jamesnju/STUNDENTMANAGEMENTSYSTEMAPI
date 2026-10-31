import { Request, Response } from 'express';
import { authService } from './auth.service';

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400_000,
    });
    res.json({ success: true, data: result });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    const data = await authService.refresh(token);
    res.cookie('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.json({ success: true, data });
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (token) await authService.logout(token);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, data: null });
  },

  async me(req: Request, res: Response) {
    res.json({ success: true, data: req.user });
  },
};