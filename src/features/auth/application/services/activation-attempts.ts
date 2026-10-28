import { DomainError } from '../../../../common/errors/domain-error';
import { AccessKeyAttemptLimiter } from './access-key-attempt-limiter.service';

// Los códigos de activación comparten el freno de las claves de acceso (10 fallos cada 15 min por dirección, DT-37): es la misma superficie —dos endpoints públicos
// que reciben un código— y, juntos, no hay dos presupuestos de intentos para adivinar. Solo cambia el código del error que ve el cliente.
export function assertActivationAllowed(limiter: AccessKeyAttemptLimiter, ip: string): void {
  try {
    limiter.assertAllowed(ip);
  } catch (error) {
    if (error instanceof DomainError && error.code === 'ACCESS_KEY_RATE_LIMITED') throw new DomainError('ACTIVATION_CODE_RATE_LIMITED', error.details);
    throw error;
  }
}