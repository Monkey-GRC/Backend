// src/config/swagger.config.ts

import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('Monkey Backend')
        .setDescription('Servicios API para la aplicación Monkey')
        .setVersion('1.0')
        .addCookieAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config, {
        operationIdFactory: (
            controllerKey: string,
            methodKey: string
        ) => methodKey,
        ignoreGlobalPrefix: false,
    });

    SwaggerModule.setup('v1/docs', app, document);
}  
//Testeando bitbucket