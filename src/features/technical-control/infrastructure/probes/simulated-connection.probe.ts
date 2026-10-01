import { TECHNICAL_COVERAGE_TOTAL } from '../../../../common/catalogs/technical-catalogs';
import { ConnectionProbe, ProbeInput, ProbeResult } from '../../domain/ports/connection-probe';

// Marca con la que una prueba o una demostración provoca un fallo de permisos: si cualquier valor
// de las credenciales la contiene, la conexión «no tiene permisos suficientes».
export const SIMULATED_DENIED_MARKER = 'permission-denied';

// Campo que se señala al fallar, según el tipo de credencial que el cliente envió.
const FIELD_BY_KEY: [string, string][] = [
  ['read_only_role', 'credentials.read_only_role'],
  ['ssh_user', 'credentials.ssh_user'],
  ['db_user', 'credentials.db_user'],
];

// SOLO para desarrollo y demostración (PROBE_MODE=simulated). No toca el sistema del cliente: da por
// buena la conexión si las credenciales están completas, y por eso NUNCA confirma que el activo
// opere (`confirmsOperation = false`) y la pantalla lo etiqueta como «modo demostración».
export class SimulatedConnectionProbe extends ConnectionProbe {
  readonly mode = 'simulated' as const;
  readonly confirmsOperation = false;

  async validate(input: ProbeInput): Promise<ProbeResult> {
    const values = Object.values(input.credentials ?? {}).filter((v): v is string => typeof v === 'string');
    if (values.some((v) => v.includes(SIMULATED_DENIED_MARKER))) {
      const present = FIELD_BY_KEY.find(([key]) => key in (input.credentials ?? {}));
      return {
        ok: false,
        fields: [{ field: present?.[1] ?? 'credentials', code: 'connection.permission_denied' }],
      };
    }
    return { ok: true, technicalCoverage: `${TECHNICAL_COVERAGE_TOTAL}/${TECHNICAL_COVERAGE_TOTAL}`, checksAvailable: 402 };
  }
}
