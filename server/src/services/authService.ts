import jwt from 'jsonwebtoken';
import type { IUser } from '../models';

const TOKEN_EXPIRATION = '1h';

export interface AuthTokenPayload {
  sub: string;
  username: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export function generateToken(user: IUser): string {
  const payload: AuthTokenPayload = { sub: user._id.toString(), username: user.username };
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_EXPIRATION });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getSecret()) as AuthTokenPayload;
}
