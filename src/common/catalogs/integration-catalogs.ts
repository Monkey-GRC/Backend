import { IntegrationPurpose } from '../../../generated/prisma/enums';

// Las listas de Integraciones que sirve `GET /v1/catalogs/{nombre}` (contracts/enums/integraciones.md, D110). El propósito se lee del enum de Postgres; el estado NO es columna: se deriva de las conexiones.
export const INTEGRATION_PURPOSE_VALUES = Object.values(IntegrationPurpose) as IntegrationPurpose[];
export const INTEGRATION_STATUS_VALUES = ['active', 'pending', 'needs_attention'] as const;

export const INTEGRATION_ENUM_CATALOGS = {
  integration_purpose: INTEGRATION_PURPOSE_VALUES,
  integration_status: INTEGRATION_STATUS_VALUES,
} as const;
