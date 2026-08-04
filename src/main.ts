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

  // Configuración de CORS
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4201'],
    allowedHeaders: 'Content-Type, Authorization, Accept-Language, mnk-client-identifier, mnk-client-key',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Configuración del Swagger
  setupSwagger(app);

  await app.listen(process.env.PORT || 3000);

  console.log(`App corriendo en el puerto ${process.env.PORT}`)
}
bootstrap();
