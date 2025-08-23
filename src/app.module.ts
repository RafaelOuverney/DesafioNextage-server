import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { TaskController } from './controller/task.controller';
import { UserController } from './controller/user.controller';
import { AuthController } from './controller/auth.controller';
import { TasksService } from './services/task.service';
import { UsersService } from './services/user.service';
import { PrismaService } from './services/prisma.service';
import { ColumnsController } from './controller/columns.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [EmailModule, ConfigModule.forRoot({
    isGlobal: true,
  })],
  controllers: [AppController, TaskController, UserController, AuthController, ColumnsController],
  providers: [AppService, TasksService, UsersService, PrismaService, AuthService],
})
export class AppModule {}
