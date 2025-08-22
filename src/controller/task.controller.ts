import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { TasksService } from '../services/task.service';
import { User as UserModel, Task as TaskModel } from '@prisma/client';

  @Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TasksService) {}

  @Get(':id')
  async getTaskById(@Param('id') id: string): Promise<TaskModel | null> {
    return this.taskService.task({ id: Number(id) });
  }

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
  async getFilteredTasks(
    @Param('searchString') searchString: string,
  ): Promise<TaskModel[]> {
    return this.taskService.tasks({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
          {
            createdAt: { equals: searchString },
          },
        ],
      },
    });
  }

  @Post()
  async createTask(
    @Body() taskData: { title: string; content?: string; authorEmail: string },
  ): Promise<TaskModel> {
    const { title, content, authorEmail } = taskData;
    // pass the DTO shape the service expects (authorEmail), not the Prisma relation
    return this.taskService.createTask({
      title,
      content,
      authorEmail,
    });
  }


  @Put(':id')
  async updateTask(@Param('id') id: string): Promise<TaskModel> {
    return this.taskService.updateTask({
      where: { id: Number(id) },
      data: { finished: true },
    });
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<TaskModel> {
    return this.taskService.deleteTask({ id: Number(id) });
  }
}
