import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { DomainError } from '../../../common/errors/domain-error';

// SEG-47: la API interna del trabajador. No usa la sesión del cliente: va con un secreto de servicio (`RUNNER_TOKEN`) y solo desde la red
// interna. Tres defensas, de más barata a más fuerte:
//  1. Sin `RUNNER_TOKEN` configurado, la API NO EXISTE (404): apagada por defecto.
//  2. Una petición que llegó por el proxy (trae X-Forwarded-For / X-Real-IP) se rechaza como si no existiera: el trabajador llama directo, por la
//     red de Docker. Es defensa en profundidad; la barrera principal es que el proxy no publique `/internal`.
//  3. El token se compara en tiempo constante (sobre su hash, para que la longitud tampoco filtre) y nunca se registra.
const digest = (v: string) => createHash('sha256').update(v).digest();

@Injectable()
export class RunnerTokenGuard implements CanActivate {
  private readonly expected: Buffer | null;

  constructor(config: ConfigService) {
    const token = config.get<string>('RUNNER_TOKEN')?.trim();
    this.expected = token ? digest(token) : null;
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (!this.expected) throw new DomainError('NOT_FOUND');
    if (req.headers['x-forwarded-for'] || req.headers['x-real-ip']) throw new DomainError('NOT_FOUND');
    const header = req.headers.authorization ?? '';
    const given = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!given || !timingSafeEqual(digest(given), this.expected)) throw new DomainError('UNAUTHENTICATED');
    return true;
  }
}
