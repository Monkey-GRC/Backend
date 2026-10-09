import { ConfigService } from '@nestjs/config';
import { PROBE_MODES, ProbeMode } from '../../../../common/catalogs/technical-catalogs';
import { ConnectionProbe } from '../../domain/ports/connection-probe';
import { ScanRepository } from '../../domain/repositories/scan.repository';
import { RunnerConnectionProbe } from './runner-connection.probe';
import { SimulatedConnectionProbe } from './simulated-connection.probe';
import { UnavailableConnectionProbe } from './unavailable-connection.probe';

// Elige la sonda según PROBE_MODE. Sin valor, `unavailable`. `runner` valida contra la cuenta real a través del trabajador (D58). La simulada se niega a existir en
// producción: un cliente real nunca debe ver una conexión «validada» que no se comprobó.
export function createConnectionProbe(config: ConfigService, scans: ScanRepository): ConnectionProbe {
  const mode = (config.get<string>('PROBE_MODE')?.trim() || 'unavailable') as ProbeMode;
  if (!PROBE_MODES.includes(mode)) {
    throw new Error(`PROBE_MODE inválido: "${mode}". Usa ${PROBE_MODES.join(' o ')}.`);
  }
  if (mode === 'simulated' && config.get<string>('NODE_ENV') === 'production') {
    throw new Error('PROBE_MODE=simulated no está permitido en producción.');
  }
  if (mode === 'runner') {
    // Cuánto espera el cliente la respuesta de una validación antes de decirle «no disponible». El trabajador suele tardar 1-3 s.
    const waitSeconds = Number(config.get<string>('VALIDATION_WAIT_SECONDS')?.trim() || 25);
    if (!Number.isInteger(waitSeconds) || waitSeconds < 1 || waitSeconds > 60) throw new Error('VALIDATION_WAIT_SECONDS debe ser un entero entre 1 y 60.');
    return new RunnerConnectionProbe(scans, { waitMs: waitSeconds * 1000, pollMs: 300 });
  }
  return mode === 'simulated' ? new SimulatedConnectionProbe() : new UnavailableConnectionProbe();
}
