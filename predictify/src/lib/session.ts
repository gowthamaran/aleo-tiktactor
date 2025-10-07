import { IronSessionOptions } from 'iron-session';

export interface SessionData {
  userId?: string;
  username?: string;
  isAdmin?: boolean;
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_PASSWORD || 'dev-secret-change-me-please-32chars-min',
  cookieName: 'predictify_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};
