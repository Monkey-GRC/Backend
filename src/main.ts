import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';
import cookieParser from 'cookie-parser';
import { UserContextInterceptor } from './common/interceptors/user-context.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  app.use(cookieParser());

  app.useGlobalInterceptors(new UserContextInterceptor());

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

  // Swagger config
  setupSwagger(app);

  await app.listen(process.env.PORT || 3000);

  console.log(`App corriendo en el puerto ${process.env.PORT}`);
}
bootstrap();
