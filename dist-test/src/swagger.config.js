"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_1 = require("@nestjs/swagger");
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Monkey Backend')
        .setDescription('Servicios API para la aplicación Monkey')
        .setVersion('1.0')
        .addCookieAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey, methodKey) => methodKey,
        ignoreGlobalPrefix: false,
    });
    swagger_1.SwaggerModule.setup('v1/docs', app, document);
}
//# sourceMappingURL=swagger.config.js.map