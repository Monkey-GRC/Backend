// La lectura automática de la sonda de un servidor (D112). Dominio puro: sin Nest, sin Prisma, sin reloj propio (se le pasa `now`).
//
// La sonda no avisa a Monkey cuando un servidor se conecta: Monkey tiene que ir a leerla. Este archivo decide A QUÉ servidores les toca, y es lo único que decide. Así el
// cliente instala y la pantalla pasa sola de «Esperando» a «Conectado», y un servidor conectado se relee cada cierto tiempo para que el cumplimiento no envejezca.

export type ReadingConfig = {
  // Cada cuánto se busca un servidor que todavía no se conecta (cuando Monkey ya le entregó el comando).
  watchIntervalMinutes: number;
  // Hasta cuándo se le insiste, contado desde que Monkey creó su agente. Pasado ese plazo ya no se busca solo: el cliente decide (comprobar ahora o generar un comando nuevo).
  watchWindowHours: number;
  // Cada cuánto se relee un servidor conectado.
  refreshIntervalHours: number;
  // Cada cuánto se vuelve a intentar con uno desconectado o cuya última lectura falló de verdad (no es «todavía no está listo»).
  recheckIntervalMinutes: number;
};

export const DEFAULT_READING_CONFIG: ReadingConfig = { watchIntervalMinutes: 3, watchWindowHours: 24, refreshIntervalHours: 24, recheckIntervalMinutes: 60 };

// Por qué una lectura puede no estar lista sin que sea un problema: el servidor todavía no terminó su primera revisión, o no está encendido. Una lectura AUTOMÁTICA que termina
// así no es un error para el cliente: no sale en su historial ni se audita (cada 3 minutos serían cientos de filas); lo que le importa es el estado del servidor.
export const NOT_READY_REASONS: readonly string[] = ['connection.agent_no_scan_yet', 'connection.agent_disconnected'];
export const isNotReadyReason = (reason: string): boolean => NOT_READY_REASONS.includes(reason);

export type AgentConnectionStatus = 'pending' | 'connected' | 'disconnected';

// Cómo terminó el último intento de lectura de ese servidor: `completed` guardó resultados, `not_ready` aún no estaba listo, `failed` falló de verdad.
export type LastAttempt = { outcome: 'completed' | 'not_ready' | 'failed'; at: Date };

export type AgentReadingFacts = {
  tenantId: string;
  assetId: string;
  status: AgentConnectionStatus;
  // Cuándo Monkey terminó de crear su agente (la última ejecución `enrollment` completada). Desde ahí corre el plazo de búsqueda.
  enrolledAt: Date | null;
  // La última vez que se guardó una lectura de este servidor.
  lastSyncAt: Date | null;
  lastAttempt: LastAttempt | null;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** Del estado de una ejecución de lectura a cómo terminó. `cancelled` es como se cierra una lectura automática que no estaba lista. */
export function attemptOutcome(status: string): LastAttempt['outcome'] {
  return status === 'completed' ? 'completed' : status === 'cancelled' ? 'not_ready' : 'failed';
}

/** ¿Monkey sigue buscando a este servidor por su cuenta? La pantalla lo usa para decir «seguimos esperando» o «no lo vimos conectarse». */
export function isWatching(f: { status: AgentConnectionStatus | 'removed'; enrolledAt: Date | null }, cfg: ReadingConfig, now: Date): boolean {
  if (f.status === 'disconnected') return true; // se vuelve a intentar sin plazo: si el servidor vuelve, se entera solo
  if (f.status !== 'pending') return false;
  return f.enrolledAt !== null && now.getTime() - f.enrolledAt.getTime() <= cfg.watchWindowHours * HOUR;
}

// Cuánto hay que esperar tras el último intento antes de volver a intentar, según cómo terminó.
const spacing = (a: LastAttempt, cfg: ReadingConfig): number => (a.outcome === 'failed' ? cfg.recheckIntervalMinutes : a.outcome === 'not_ready' ? cfg.watchIntervalMinutes : 0) * MINUTE;

/** ¿Toca leer este servidor ahora? */
export function isReadingDue(f: AgentReadingFacts, cfg: ReadingConfig, now: Date): boolean {
  const t = now.getTime();
  const last = f.lastAttempt;
  const restedEnough = !last || t - last.at.getTime() >= spacing(last, cfg);
  switch (f.status) {
    case 'pending':
      return isWatching(f, cfg, now) && restedEnough;
    case 'connected':
      // Releer a diario, y no machacar a uno cuya última lectura falló.
      return (f.lastSyncAt === null || t - f.lastSyncAt.getTime() >= cfg.refreshIntervalHours * HOUR) && restedEnough;
    case 'disconnected':
      // Sin una lectura buena no hay cadencia propia: se reintenta cada `recheckIntervalMinutes`, contado desde el último intento (sea cual sea su resultado).
      return !last || t - last.at.getTime() >= cfg.recheckIntervalMinutes * MINUTE;
  }
}
