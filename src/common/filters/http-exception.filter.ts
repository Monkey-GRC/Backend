import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DomainError } from '../errors/domain-error';
import { DOMAIN_ERROR_CATALOG } from '../errors/domain-error.catalog';
import { ValidationException } from '../errors/validation.exception';

// status HTTP → error.code estable del contrato (conventions.md, tabla de errores comunes).
const HTTP_CODES: Record<number, { code: string; messageKey: string }> = {
  400: { code: 'BAD_REQUEST', messageKey: 'common.bad_request' },
  401: { code: 'UNAUTHENTICATED', messageKey: 'common.unauthenticated' },
  403: { code: 'FORBIDDEN', messageKey: 'common.forbidden' },
  404: { code: 'NOT_FOUND', messageKey: 'common.not_found' },
  409: { code: 'CONFLICT', messageKey: 'common.conflict' },
  422: { code: 'VALIDATION_FAILED', messageKey: 'validation.failed' },
  429: { code: 'RATE_LIMITED', messageKey: 'common.rate_limited' },
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly i18n: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const lang = I18nContext.current(host)?.lang;
    const t = (key: string) => this.i18n.translate(key, { lang }) as string;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let messageKey = 'common.internal_error';
    const error: Record<string, unknown> = {};

    if (exception instanceof DomainError) {
      ({ status, messageKey } = DOMAIN_ERROR_CATALOG[exception.code]);
      code = exception.code;
      Object.assign(error, exception.details);
    } else if (exception instanceof ValidationException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      code = 'VALIDATION_FAILED';
      messageKey = 'validation.failed';
      error.fields = exception.fields.map((f) => ({
        ...f,
        message: t(`validation.${f.code.replace('.', '_')}`),
      }));
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      ({ code, messageKey } = HTTP_CODES[status] ?? { code, messageKey });
    } else {
      // Nunca se expone el detalle interno (conventions.md); solo queda en el log.
      this.logger.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      message: t(messageKey),
      data: null,
      error: { code, ...error },
    });
  }
}
