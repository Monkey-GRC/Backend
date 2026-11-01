// SEG-19 · Ventana deslizante exacta: guarda el instante de cada petición aceptada de los últimos `windowMs` y rechaza cuando ya hay `limit`. Sin ráfagas dobles en el
// borde de una ventana fija. Vive en la memoria de la instancia (DT-37): con varias réplicas el tope real sería por réplica y se reinicia al reiniciar.
export type Decision = { allowed: true } | { allowed: false; retryAfterMs: number };

const SWEEP_EVERY_MS = 60_000;

export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>();
  private lastSweep = 0;

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** ¿Cabe una petición más para `key`? No la cuenta: eso lo hace `record`, para que una petición rechazada por OTRO tope no gaste este. */
  check(key: string, now = Date.now()): Decision {
    const recent = this.recent(key, now);
    if (recent.length < this.limit) return { allowed: true };
    // Vuelve a caber cuando sale de la ventana la petición más vieja.
    return { allowed: false, retryAfterMs: Math.max(1, recent[0] + this.windowMs - now) };
  }

  record(key: string, now = Date.now()): void {
    const recent = this.recent(key, now);
    recent.push(now);
    this.hits.set(key, recent);
    this.sweep(now);
  }

  private recent(key: string, now: number): number[] {
    const kept = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (kept.length === 0) this.hits.delete(key);
    return kept;
  }

  // Una clave que no vuelve (un usuario que se fue) no debe quedarse para siempre: se barre el mapa como máximo una vez por minuto.
  private sweep(now: number): void {
    if (now - this.lastSweep < SWEEP_EVERY_MS) return;
    this.lastSweep = now;
    for (const key of [...this.hits.keys()]) this.recent(key, now);
  }
}
