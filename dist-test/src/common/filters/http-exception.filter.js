"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const nestjs_i18n_1 = require("nestjs-i18n");
const domain_error_1 = require("../errors/domain-error");
const domain_error_catalog_1 = require("../errors/domain-error.catalog");
const validation_exception_1 = require("../errors/validation.exception");
const HTTP_CODES = {
    400: { code: 'BAD_REQUEST', messageKey: 'common.bad_request' },
    401: { code: 'UNAUTHENTICATED', messageKey: 'common.unauthenticated' },
    403: { code: 'FORBIDDEN', messageKey: 'common.forbidden' },
    404: { code: 'NOT_FOUND', messageKey: 'common.not_found' },
    409: { code: 'CONFLICT', messageKey: 'common.conflict' },
    422: { code: 'VALIDATION_FAILED', messageKey: 'validation.failed' },
    429: { code: 'RATE_LIMITED', messageKey: 'common.rate_limited' },
};
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    i18n;
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    constructor(i18n) {
        this.i18n = i18n;
    }
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        const lang = nestjs_i18n_1.I18nContext.current(host)?.lang;
        const t = (key) => this.i18n.translate(key, { lang });
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let code = 'INTERNAL_ERROR';
        let messageKey = 'common.internal_error';
        const error = {};
        if (exception instanceof domain_error_1.DomainError) {
            ({ status, messageKey } = domain_error_catalog_1.DOMAIN_ERROR_CATALOG[exception.code]);
            code = exception.code;
            Object.assign(error, exception.details);
        }
        else if (exception instanceof validation_exception_1.ValidationException) {
            status = common_1.HttpStatus.UNPROCESSABLE_ENTITY;
            code = exception.override?.code ?? 'VALIDATION_FAILED';
            messageKey = exception.override?.messageKey ?? 'validation.failed';
            error.fields = exception.fields.map((f) => ({
                ...f,
                message: t(`validation.${f.code.replace('.', '_')}`),
            }));
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            ({ code, messageKey } = HTTP_CODES[status] ?? { code, messageKey });
        }
        else {
            this.logger.error(exception);
        }
        response.status(status).json({
            statusCode: status,
            message: t(messageKey),
            data: null,
            error: { code, ...error },
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [nestjs_i18n_1.I18nService])
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map