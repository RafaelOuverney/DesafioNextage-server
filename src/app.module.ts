import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { TaskController } from './controller/task.controller';
import { UserController } from './controller/user.controller';
import { TasksService } from './services/task.service';
import { UsersService } from './services/user.service';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [EmailModule, ConfigModule.forRoot({
    isGlobal: true,
  })],
  controllers: [AppController, TaskController, UserController],
  providers: [AppService, TasksService, UsersService, PrismaService],
})
export class AppModule {}
