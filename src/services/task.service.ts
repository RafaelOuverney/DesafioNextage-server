import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma, Task } from '@prisma/client';

export interface CreateTaskDto {
  title: string;
  content?: string | null;
  authorEmail: string;
  columnId?: number; // optional: attach to an existing column
}
@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  async task(
    taskWhereUniqueInput: Prisma.TaskWhereUniqueInput,
  ): Promise<Task | null> {
    // guard: ensure a valid unique identifier is provided to avoid Prisma validation errors
    const maybeId = (taskWhereUniqueInput as any)?.id;
    if (typeof maybeId === 'undefined' || maybeId === null) {
      // return null for missing id instead of calling prisma with an invalid where input
      return null;
    }
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
    const p = this.prisma as any;

    // find author (if exists)
    const author = await p.user.findUnique({ where: { email: data.authorEmail } }).catch(() => null);

    // try to use provided columnId if valid and owned by the author
    let columnToUse: any = null;
    if (data.columnId) {
      columnToUse = await p.columns.findUnique({ where: { id: Number(data.columnId) } }).catch(() => null);
      if (columnToUse && author && columnToUse.ownerId && columnToUse.ownerId !== author.id) {
        // provided column doesn't belong to this user -> ignore it
        columnToUse = null;
      }
    }

    // if no valid column chosen, find one owned by the author or create default 'A Fazer'
    if (!columnToUse) {
      if (author) {
        columnToUse = await p.columns.findFirst({ where: { ownerId: author.id } });
        if (!columnToUse) {
          columnToUse = await p.columns.create({ data: { title: 'A Fazer', owner: { connect: { id: author.id } } } });
        }
      } else {
        // no author (anonymous) -> try any column, otherwise create a default global column
        columnToUse = await p.columns.findFirst();
        if (!columnToUse) {
          columnToUse = await p.columns.create({ data: { title: 'A Fazer' } });
        }
      }
    }

    const createData: any = {
      title: data.title,
      content: data.content ?? null,
      author: { connect: { email: data.authorEmail } },
      column: { connect: { id: columnToUse.id } },
      finished: false,
    };

    return p.task.create({ data: createData });
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
