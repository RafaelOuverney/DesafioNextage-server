import { Injectable, UnauthorizedException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

@Injectable()
export class AuthService {
  sign(payload: any) {
    return sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  verify(token: string) {
    try {
      return verify(token, JWT_SECRET) as any;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
