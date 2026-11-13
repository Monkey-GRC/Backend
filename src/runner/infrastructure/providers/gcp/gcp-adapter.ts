import type { CloudAdapter } from '../cloud-adapters';
import { GcpCredentialBroker } from './gcp-credential-broker';
import { prowlerGcpProfile } from './gcp-engine-profile';

// Sin inventario (DT-102): validar un proyecto de GCP solo comprueba el acceso.
export const createGcpAdapter = (engineImage: string, federationRoleArn: string): CloudAdapter => ({
  broker: new GcpCredentialBroker(federationRoleArn),
  engineProfile: prowlerGcpProfile(engineImage),
  inventory: null,
});
