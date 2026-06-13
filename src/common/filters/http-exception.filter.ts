// filters/http-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

    constructor(private readonly i18n: I18nService) { }

    catch(exception: unknown, host: ArgumentsHost) {
        console.error('Exception caught by AllExceptionsFilter:', exception);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : this.i18n.t('error.INTERNAL_SERVER_ERROR');

        response.status(status).json({
            statusCode: status,
            message: typeof message === 'string' ? message : (message as any)?.message || message,
        });
    }
}
