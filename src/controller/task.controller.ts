import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { TasksService } from '../services/task.service';
import { PrismaService } from '../services/prisma.service';
import { Task as TaskModel } from '@prisma/client';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TasksService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getAllTasks(): Promise<TaskModel[]> {
    return this.taskService.tasks({});
  }

  @Get('finished')
  async getFinishedTasks(): Promise<TaskModel[]> {
    return this.taskService.tasks({
      where: { finished: true },
    });
  }

  @Get('filtered/:searchString')
  async getFilteredTasks(@Param('searchString') searchString: string): Promise<TaskModel[]> {
    return this.taskService.tasks({
      where: {
        OR: [
          { title: { contains: searchString } },
          { content: { contains: searchString } },
        ],
      },
    });
  }

  @Get('author/:email')
  async getTasksByAuthor(@Param('email') email: string): Promise<TaskModel[]> {
    return this.taskService.tasks({
      where: {
        author: { is: { email } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string): Promise<TaskModel | null> {
    const num = Number(id);
    if (Number.isNaN(num)) return null;
    return this.taskService.task({ id: num });
  }

  @UseGuards(JwtGuard)
  @Post()
  async createTask(
    @CurrentUser() user: any,
    @Body() taskData: { title: string; content?: string; columnId?: number },
  ): Promise<TaskModel> {
    const { title, content, columnId } = taskData;
    return this.taskService.createTask({
      title,
      content,
      authorEmail: user.email,
      columnId,
    });
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async updateTask(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string; columnId?: number; finished?: boolean },
  ): Promise<TaskModel> {
    // ensure task exists and belongs to the user
    const task = await this.taskService.task({ id: Number(id) });
    if (!task) throw new ForbiddenException('Tarefa não encontrada');
    if (!task.authorId) throw new ForbiddenException('Tarefa sem autor');

    const author = await this.usersService.user({ email: user.email }).catch(() => null);
    if (!author || author.id !== task.authorId) throw new ForbiddenException('Nenhuma permissão para editar esta tarefa');

    const data: any = {};
    if (typeof body.title !== 'undefined') data.title = body.title;
    if (typeof body.content !== 'undefined') data.content = body.content;
    if (typeof body.finished !== 'undefined') data.finished = body.finished;

    if (typeof body.columnId !== 'undefined') {
      // validate column ownership when author exists
      const colId = Number(body.columnId);
  const column = await (this.prisma as any).columns.findUnique({ where: { id: colId } }).catch(() => null);
      if (!column) throw new ForbiddenException('Coluna não encontrada');
      if (author && column.ownerId && column.ownerId !== author.id) {
        throw new ForbiddenException('Não permitido conectar tarefa a uma coluna de outro usuário');
      }
      data.column = { connect: { id: colId } };
    }

    return this.taskService.updateTask({ where: { id: Number(id) }, data });
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteTask(@CurrentUser() user: any, @Param('id') id: string): Promise<TaskModel> {
    const task = await this.taskService.task({ id: Number(id) });
    if (!task) throw new ForbiddenException('Tarefa não encontrada');
    const author = await this.usersService.user({ email: user.email }).catch(() => null);
    if (!author || author.id !== task.authorId) throw new ForbiddenException('Nenhuma permissão para apagar esta tarefa');
    return this.taskService.deleteTask({ id: Number(id) });}}
