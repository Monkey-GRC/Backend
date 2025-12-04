import { env } from 'prisma/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  // Filtro para manejar excepciones globalmente
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configuración de CORS
  app.enableCors({
    origin: '*',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Configuración del Swagger
  setupSwagger(app);

  await app.listen(process.env.PORT || 3000);

  console.log(`App corriendo en el puerto ${process.env.PORT}`)
}
bootstrap();
