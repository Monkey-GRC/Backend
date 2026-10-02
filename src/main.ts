import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  app.use(cookieParser());

  // CORS config
  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : [
          'http://localhost:4200',
          'http://127.0.0.1:4200',
          'http://localhost:4201',
          'http://127.0.0.1:4201',
        ],
    allowedHeaders:
      'Content-Type, Authorization, Accept-Language, mnk-client-identifier, mnk-client-key',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
