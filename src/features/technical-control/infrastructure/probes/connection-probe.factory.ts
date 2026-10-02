import { ConfigService } from '@nestjs/config';
import { PROBE_MODES, ProbeMode } from '../../../../common/catalogs/technical-catalogs';
import { ConnectionProbe } from '../../domain/ports/connection-probe';
import { SimulatedConnectionProbe } from './simulated-connection.probe';
import { UnavailableConnectionProbe } from './unavailable-connection.probe';

// Elige la sonda según PROBE_MODE. Sin valor, `unavailable`. La simulada se niega a existir en
// producción: un cliente real nunca debe ver una conexión «validada» que no se comprobó.
export function createConnectionProbe(config: ConfigService): ConnectionProbe {
  const mode = (config.get<string>('PROBE_MODE')?.trim() || 'unavailable') as ProbeMode;
  if (!PROBE_MODES.includes(mode)) {
    throw new Error(`PROBE_MODE inválido: "${mode}". Usa ${PROBE_MODES.join(' o ')}.`);
  }
  if (mode === 'simulated' && config.get<string>('NODE_ENV') === 'production') {
    throw new Error('PROBE_MODE=simulated no está permitido en producción.');
  }
  return mode === 'simulated' ? new SimulatedConnectionProbe() : new UnavailableConnectionProbe();
}
