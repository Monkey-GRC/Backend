import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';

const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 10;

// Freno al adivinar claves de acceso desde una misma dirección: 10 intentos fallidos cada 15 minutos.
// La clave es larga y aleatoria, pero los dos endpoints que la reciben son públicos. Vive en memoria
// de la instancia (DT-37): con varias réplicas el tope real sería por réplica.
@Injectable()
export class AccessKeyAttemptLimiter {
  private readonly failures = new Map<string, number[]>();

  // Lanza ACCESS_KEY_RATE_LIMITED si la dirección ya agotó sus intentos.
  assertAllowed(ip: string, now = Date.now()): void {
    if (this.recent(ip, now).length >= MAX_FAILURES) throw new DomainError('ACCESS_KEY_RATE_LIMITED');
  }

  recordFailure(ip: string, now = Date.now()): void {
    const recent = this.recent(ip, now);
    recent.push(now);
    this.failures.set(ip, recent);
  }

  // Un canje bien hecho borra el historial de esa dirección.
  clear(ip: string): void {
    this.failures.delete(ip);
  }

  private recent(ip: string, now: number): number[] {
    const recent = (this.failures.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length === 0) this.failures.delete(ip);
    return recent;
  }
}
