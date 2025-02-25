import { PayloadData } from '../../types';

export interface ITokenService {
  generateToken(payload: object, expiresIn: string, notBefore?: string): Promise<string>;

  generateAccessToken(payload: PayloadData, expiresIn?: string): Promise<string>;

  generateRefreshToken(payload: PayloadData, expiresIn?: string, notBefore?: string): Promise<string>;

  verifyToken(token: string): Promise<any>;
}
