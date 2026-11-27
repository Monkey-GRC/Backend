// El botón «Conectar Microsoft 365» (D157): el cliente autoriza la aplicación de Monkey en su organización. Dos puertos, para que los casos de uso no sepan de criptografía.

// Un recibo firmado por Monkey que viaja por el navegador entre un paso y el siguiente. Cada paso tiene su propio `step`: uno no sirve para otro.
export type ConsentStep = 'signin' | 'consent' | 'complete';
export type ConsentTicket = {
  step: ConsentStep;
  companyId: string;
  userId: string;
  assetId: string;
  // Solo en `signin`: lo que Microsoft debe devolver dentro de la identidad firmada.
  nonce?: string;
  // Desde `consent`: la organización que Monkey comprobó con la identidad firmada. Nunca sale de un parámetro de la dirección.
  tenantId?: string;
};

export abstract class ConsentTickets {
  abstract sign(ticket: ConsentTicket, ttlSeconds: number): string;
  // `null` si la firma no es de Monkey, venció o es de otro paso.
  abstract verify(value: string, step: ConsentStep): ConsentTicket | null;
}

// Lo que se lee de una identidad firmada por Microsoft, ya verificada (firma, emisor, destinatario, vigencia y `nonce`).
export type MicrosoftIdentity = {
  tenantId: string;
  // Los roles de directorio de quien inició sesión (identificadores de rol de Microsoft Entra).
  directoryRoles: string[];
};

export abstract class MicrosoftIdentityVerifier {
  // `null` si no se puede dar por buena. Lanza solo si no se pudo hablar con Microsoft.
  abstract verify(idToken: string, expected: { clientId: string; nonce: string }): Promise<MicrosoftIdentity | null>;
}
