import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ValidateSessionUseCase } from '../../application/use-cases/validate-session.use-case';
export declare class SessionAuthGuard implements CanActivate {
    private readonly reflector;
    private readonly validateSession;
    constructor(reflector: Reflector, validateSession: ValidateSessionUseCase);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
