import { DomainError } from '../../../../common/errors/domain-error';
import { ConnectionProbe, ProbeResult } from '../../domain/ports/connection-probe';

// El modo por defecto: esta instalación todavía no tiene conectores productivos. En vez de fingir
// que una conexión funciona, se dice con claridad que aún no se puede comprobar. El activo queda
// registrado y pendiente: no se marca como fallido (no es culpa del cliente).
export class UnavailableConnectionProbe extends ConnectionProbe {
  readonly mode = 'unavailable' as const;
  readonly confirmsOperation = false;

  validate(): Promise<ProbeResult> {
    return Promise.reject(new DomainError('CONNECTION_UNAVAILABLE'));
  }
}
