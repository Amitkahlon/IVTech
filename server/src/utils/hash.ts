import { createHash } from 'crypto';

export function hashPassword(password: string): string {
  return createHash('sha512').update(password, 'utf8').digest('hex');
}
