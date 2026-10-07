import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ValidationException } from './common/errors/validation.exception';

// Lo que hace que la app se comporte como la API del contrato (prefijo, cookies, validación 422). Vive aparte de
// main.ts para que las pruebas e2e levanten la app configurada EXACTAMENTE igual que en producción.
export function configureApp(app: INestApplication): void {
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
}
