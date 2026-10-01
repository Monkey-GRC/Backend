import { HttpStatus } from '@nestjs/common';
import { DomainErrorCode } from './domain-error';
export declare const DOMAIN_ERROR_CATALOG: Record<DomainErrorCode, {
    status: HttpStatus;
    messageKey: string;
}>;
