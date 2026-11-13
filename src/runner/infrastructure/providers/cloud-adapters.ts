import { Inventory } from '../../domain/inventory';
import { CredentialBroker, InventoryScanner } from '../../domain/ports';
import { FAILURE, RunnerFailure, RunnerJob, RunnerPlatform, TemporaryCredentials } from '../../domain/runner.types';
import type { EngineProfile } from '../docker-scan-engine';

// Lo que aporta cada nube al trabajador (D112): cómo obtiene credenciales, cómo se invoca el motor con ellas y, si ya existe, cómo descubre los recursos.
// El bucle (`RunNextExecution`) no sabe de nubes: recibe estos tres puertos ya enrutados por la plataforma del trabajo.
export type CloudAdapter = {
  broker: CredentialBroker;
  engineProfile: EngineProfile;
  inventory: InventoryScanner | null;
};
export type CloudAdapters = Partial<Record<RunnerPlatform, CloudAdapter>>;

// Una plataforma sin adaptador (p. ej. GCP sin la identidad de Monkey configurada en este trabajador) no se evalúa: falla con su razón, no con un error genérico.
export class RoutingCredentialBroker extends CredentialBroker {
  constructor(private readonly adapters: CloudAdapters) {
    super();
  }

  obtain(job: RunnerJob): Promise<TemporaryCredentials> {
    const adapter = this.adapters[job.platform];
    if (!adapter) return Promise.reject(new RunnerFailure(FAILURE.methodNotSupportedByRunner));
    return adapter.broker.obtain(job);
  }
}

// Las credenciales dicen de qué nube son: no hace falta repetir la plataforma.
export class RoutingInventoryScanner extends InventoryScanner {
  constructor(private readonly adapters: CloudAdapters) {
    super();
  }

  async discover(input: { accountId: string | null; regions: string[]; credentials: TemporaryCredentials }): Promise<Inventory | null> {
    const scanner = this.adapters[input.credentials.provider]?.inventory;
    return scanner ? scanner.discover(input) : null;
  }
}

// El perfil del motor de cada nube, para `DockerScanEngine`: sale de los mismos adaptadores que el broker y el inventario.
export const engineProfileFor = (adapters: CloudAdapters) => (provider: RunnerPlatform): EngineProfile | undefined => adapters[provider]?.engineProfile;
