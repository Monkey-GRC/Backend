// En qué punto está la instalación de la sonda en un servidor (D113). Dominio puro: sin Nest, sin Prisma, sin reloj propio (se le pasa `now`).
//
// Es lo que la pantalla consulta una y otra vez mientras el trabajador crea el agente: no lleva ningún secreto. El comando (con la clave) se pide aparte, una
// sola vez (`reveal`), para que un reintento del navegador o de un proxy no la gaste.

export type InstallStatus =
  // Nada empezado: nadie ha pedido todavía el comando.
  | 'not_started'
  // El trabajador está creando el agente en la sonda (unos segundos).
  | 'preparing'
  // El agente está creado y el comando se puede pedir, una vez, hasta que caduque.
  | 'ready'
  // El comando ya se entregó (o caducó). No se vuelve a mostrar: si no se copió, se genera uno nuevo.
  | 'delivered'
  // El trabajador no pudo crear el agente.
  | 'failed';

export type EnrollmentExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type InstallFacts = {
  agentId: string | null;
  hasKey: boolean;
  keyExpiresAt: Date | null;
  // La última ejecución de tipo `enrollment` de este activo, si hubo alguna.
  latestEnrollment: { status: EnrollmentExecutionStatus; failureReason: string | null } | null;
};

export type InstallState = { status: InstallStatus; failureReason: string | null };

export function installState(facts: InstallFacts, now: Date): InstallState {
  // 1. Hay una clave vigente: el comando se puede pedir. Manda sobre todo lo demás (p. ej. sobre una ejecución vieja que quedó anotada).
  if (facts.hasKey && facts.keyExpiresAt !== null && facts.keyExpiresAt.getTime() > now.getTime()) return { status: 'ready', failureReason: null };
  // 2. El trabajador está en ello.
  const e = facts.latestEnrollment;
  if (e && (e.status === 'queued' || e.status === 'running')) return { status: 'preparing', failureReason: null };
  // 3. El agente existe y no hay clave vigente: ya se entregó, o caducó sin leerse. En los dos casos no se vuelve a mostrar.
  if (facts.agentId !== null) return { status: 'delivered', failureReason: null };
  // 4. Se intentó y no se pudo.
  if (e && (e.status === 'failed' || e.status === 'cancelled')) return { status: 'failed', failureReason: e.failureReason };
  return { status: 'not_started', failureReason: null };
}
