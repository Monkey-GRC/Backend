import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { IntegrationConnections } from '../../domain/evidence/integration-connections';
import { ConnectedIntegrationCategories, NO_INTEGRATIONS } from '../../domain/evidence/test-evidence-source';

// MD-499 · Hoy ninguna empresa puede conectar una integración de las categorías del catálogo (MD-497 las construye): todas las pruebas de fuente `integration` aceptan subida de respaldo.
// MD-497 reemplaza esta clase por la que consulta las conexiones activas del servicio; nada más cambia.
@Injectable()
export class NoIntegrationConnections extends IntegrationConnections {
  connectedCategories(_scope: TenantScope, _serviceId: string): Promise<ConnectedIntegrationCategories> {
    return Promise.resolve(NO_INTEGRATIONS);
  }
}
