import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly i18n;
    private readonly logger;
    constructor(i18n: I18nService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
