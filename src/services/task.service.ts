import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma, Task } from '@prisma/client';

export interface CreateTaskDto {
  title: string;
  content?: string | null;
  authorEmail: string;
}
@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  async task(
    taskWhereUniqueInput: Prisma.TaskWhereUniqueInput,
  ): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: taskWhereUniqueInput,
    });
  }

  async tasks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<Task[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.task.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createTask(data: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: data.title,
        content: data.content,
        author: {
          connect: { email: data.authorEmail },
        },
        finished: false,
      },
    });
  }


  async updateTask(params: {
    where: Prisma.TaskWhereUniqueInput;
    data: Prisma.TaskUpdateInput;
  }): Promise<Task> {
    const { where, data } = params;
    return this.prisma.task.update({
      data,
      where,
    });
  }

  async deleteTask(where: Prisma.TaskWhereUniqueInput): Promise<Task> {
    return this.prisma.task.delete({
      where,
    });
  }
}
