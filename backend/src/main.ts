import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Важное: включает class-validator/class-transformer на всём приложении
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,            // применяет @Transform и приводит типы
      whitelist: true,            // отсекает лишние поля из тела запроса
      forbidNonWhitelisted: false // не ругается на лишние поля (можно true, если нужно строго)
    }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 3000;

  await app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
  });
}
bootstrap();
