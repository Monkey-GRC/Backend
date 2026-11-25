import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { ConnectedIntegrationCategories } from './test-evidence-source';

/**
 * MD-499 · Las categorías de integración que un servicio tiene conectadas. Es el punto donde MD-497 (integraciones de la empresa) dirá cuáles hay: las pruebas de fuente `integration`
 * de esas categorías dejan de aceptar subida (la evidencia la trae la integración) y el motor elige esa fuente en vez de la manual.
 */
export abstract class IntegrationConnections {
  abstract connectedCategories(scope: TenantScope, serviceId: string): Promise<ConnectedIntegrationCategories>;
}
