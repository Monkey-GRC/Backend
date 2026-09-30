import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationException } from './common/errors/validation.exception';
import { setupSwagger } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  app.use(cookieParser());

  // 422 con todos los errores por campo a la vez (contracts/conventions.md).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => ValidationException.fromValidationErrors(errors),
    }),
  );

  // CORS: 4200 = Monkey Platform, 4201 = Monkey Admin (angular.json de cada app).
  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : [
          'http://localhost:4200',
          'http://127.0.0.1:4200',
          'http://localhost:4201',
          'http://127.0.0.1:4201',
        ],
    allowedHeaders: 'Content-Type, Authorization, Accept-Language',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
