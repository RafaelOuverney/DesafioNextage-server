import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const { name, email, password } = dto;
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, 64).toString('hex');
    const hashed = `${salt}:${derived}`;

    try {
      // Cast data to any to avoid stale Prisma client typings if client wasn't regenerated yet.
      return await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
        } as any,
      });
    } catch (err) {
      // Map prisma unique constraint error to a friendly message
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new BadRequestException('Email already in use');
      }
      throw err;
    }
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    const payload: any = { ...data };
    if (payload.password) {
      const salt = randomBytes(16).toString('hex');
      const derived = scryptSync(String(payload.password), salt, 64).toString('hex');
      payload.password = `${salt}:${derived}`;
    }
    return this.prisma.user.update({
      data: payload,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
