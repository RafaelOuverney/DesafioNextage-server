import { Controller, Get, Post, Body, Param, Put, Delete, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../services/user.service';
import { User as UserModel } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/avatar')
  async getAvatar(@Param('id') id: string, @Res() res: Response) {
    const user = await this.usersService.user({ id: Number(id) }) as any;
    if (!user || !user.avatar) return res.status(404).send('Not found');
    const buf: Buffer = Buffer.from(user.avatar as any);
    let mime = 'application/octet-stream';
    if (buf && buf.length >= 4) {
      if (buf[0] === 0xff && buf[1] === 0xd8) mime = 'image/jpeg';
      else if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) mime = 'image/png';
      else if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) mime = 'image/gif';
    }
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=604800');
    return res.send(buf);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserModel | null> {
    return this.usersService.user({ id: Number(id) });
  }

  @Get()
  async getAllUsers(): Promise<UserModel[]> {
    return this.usersService.users({});
  }

  @Post()
  async createUser(@Body() userData: CreateUserDto): Promise<UserModel> {
    return this.usersService.createUser(userData);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: { name?: string; email?: string; password?: string; avatarBase64?: string },
  ): Promise<UserModel> {
    const payload: any = { ...data };
    if (data.avatarBase64) {
      // expect data URL or plain base64 -- strip prefix if present
      const raw = data.avatarBase64 as string;
      const idx = raw.indexOf('base64,');
      const b64 = idx >= 0 ? raw.slice(idx + 7) : raw;
      const buf = Buffer.from(b64, 'base64');
      const MAX_BYTES = 2.5 * 1024 * 1024; // 2.5 MB
      if (buf.length > MAX_BYTES) {
        throw new BadRequestException('Avatar too large. Maximum allowed size is 2.5 MB');
      }
      payload.avatar = buf;
      delete payload.avatarBase64;
    }
    return this.usersService.updateUser({ where: { id: Number(id) }, data: payload });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<UserModel> {
    return this.usersService.deleteUser({ id: Number(id) });
  }
}
