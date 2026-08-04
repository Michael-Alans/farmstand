import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws'; // <-- 1. Import this

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // 2. Add this line to force native WebSockets
  app.useWebSocketAdapter(new WsAdapter(app)); 

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ... swagger config ...

  await app.listen(4000);
}
bootstrap();