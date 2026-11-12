import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { setupSwagger } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

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
    allowedHeaders: 'Content-Type, Authorization, Accept-Language, X-Monkey-Client',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
