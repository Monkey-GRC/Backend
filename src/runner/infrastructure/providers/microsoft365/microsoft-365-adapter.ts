import type { CloudAdapter } from '../cloud-adapters';
import { Microsoft365CredentialBroker, MonkeyMicrosoftApp } from './microsoft-365-credential-broker';
import { prowlerMicrosoft365Profile } from './microsoft-365-engine-profile';

// Sin inventario: validar un tenant de Microsoft 365 solo comprueba el acceso (D154). Las conexiones con certificado propio lo traen en el trabajo; las del botón (D157) usan la aplicación de Monkey que configure este trabajador.
export const createMicrosoft365Adapter = (engineImage: string, monkeyApp: MonkeyMicrosoftApp | null = null): CloudAdapter => ({
  broker: new Microsoft365CredentialBroker(fetch, () => new Date(), monkeyApp),
  engineProfile: prowlerMicrosoft365Profile(engineImage),
  inventory: null,
});
