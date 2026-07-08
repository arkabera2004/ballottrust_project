import { randomBytes } from 'crypto';

export function generatePasswordResetToken() {

  return randomBytes(32).toString('hex');

}