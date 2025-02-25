import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const hashPassword = async (password: string, saltRounds: number = 10): Promise<string> => {
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export function generateRandomString(length = 43): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

export function sha256(buffer: string): Buffer {
  return crypto.createHash('sha256').update(buffer).digest();
}

export function base64URLEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
