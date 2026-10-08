import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import cookieParser from 'cookie-parser';
import { ValidationException } from './common/errors/validation.exception';

// Lo que hace que la app se comporte como la API del contrato (prefijo, cookies, validación 422). Vive aparte de
// main.ts para que las pruebas e2e levanten la app configurada EXACTAMENTE igual que en producción.
export function configureApp(app: INestApplication): void {
  // La API interna del trabajador (D57, SEG-47) NO lleva el prefijo público: vive en /internal/runner y solo se alcanza por la red interna.
  app.setGlobalPrefix('v1', { exclude: [{ path: 'internal/{*path}', method: RequestMethod.ALL }] });

  // El resultado de un escaneo pesa megas, y el límite por defecto de Express (100 kb) lo rechazaría. Se sube SOLO para esa ruta interna,
  // antes del lector global: subirlo para todo expondría el resto de la API a cuerpos enormes.
  // OJO: Nest busca un middleware llamado `jsonParser` y, si ya existe, NO registra el suyo para el resto de la API (todo el cuerpo llegaría
  // vacío). Por eso el lector va envuelto en una función con otro nombre.
  const largeBody = json({ limit: '25mb' });
  app.use('/internal/runner/executions', function internalLargeBody(req, res, next) {
    largeBody(req, res, next);
  });

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
