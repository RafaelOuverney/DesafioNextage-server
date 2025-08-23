import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { scryptSync } from 'crypto';
import { AuthService } from '../services/auth.service';

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private usersService: UsersService, private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;

    const user = await this.usersService.user({ email });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const parts = user.password.split(':');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const [salt, derived] = parts;
    const attempt = scryptSync(password, salt, 64).toString('hex');
    if (attempt !== derived) {
      throw new UnauthorizedException('Invalid credentials');
    }

  // Return safe user object without password and a token
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...safe } = user as any;
  const token = this.authService.sign({ id: safe.id, email: safe.email });
  return { token, user: safe };
  }
}
