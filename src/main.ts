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
    // localhost y 127.0.0.1 son hosts distintos para el navegador (cookie jars
    // separados) aunque resuelvan a la misma IP — monkey_admin se sirve por
    // 127.0.0.1 a propósito para que su sesión (MONKEY_ADMIN) nunca comparta
    // cookies con la de un tenant en frontend-platform (localhost) abierta en
    // otra pestaña. Sin esto, la cookie que gana la carrera pisa a la otra y
    // ClientCredentialsGuard responde 401 aunque el login haya sido correcto.
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:4200', 'http://127.0.0.1:4201', 'http://localhost:4201'],
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
