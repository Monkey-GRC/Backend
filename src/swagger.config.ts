import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_TAG_DESCRIPTIONS, apiDescription, isApiDocsEnabled } from './common/swagger/api-docs.config';
import { enrichApiDocument } from './common/swagger/enrich-document';

// Documentación OpenAPI (MD-182). Solo en local: ver `isApiDocsEnabled`. Apagada no registra nada, así que /v1/docs responde 404.
export function setupSwagger(app: INestApplication): boolean {
  if (!isApiDocsEnabled()) return false;

  const builder = new DocumentBuilder()
    .setTitle('Monkey · API')
    .setDescription(apiDescription())
    .setVersion('1.0')
    .addCookieAuth('mnk_access', { type: 'apiKey', in: 'cookie' }, 'cookie');
  for (const [name, description] of Object.entries(API_TAG_DESCRIPTIONS)) builder.addTag(name, description);

  const document = enrichApiDocument(
    app,
    SwaggerModule.createDocument(app, builder.build(), {
      operationIdFactory: (controllerKey: string, methodKey: string) => `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
      ignoreGlobalPrefix: false,
    }),
  );

  SwaggerModule.setup('v1/docs', app, document, {
    customSiteTitle: 'Monkey · API',
    swaggerOptions: { persistAuthorization: true, docExpansion: 'none' },
  });
  new Logger('Swagger').log('Documentación de la API en /v1/docs (solo local)');
  return true;
}
