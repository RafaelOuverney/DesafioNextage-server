import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // increase payload limits to allow base64 image uploads
  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ limit: '8mb', extended: true }));

  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
