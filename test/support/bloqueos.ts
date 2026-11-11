import { connect } from './db';
import { owner } from './app';

// Pruebas deterministas de bloqueos: una conexión `pg` sostiene filas (la «otra transacción») y se espera a que Postgres diga que las peticiones están bloqueadas por ella
// (pg_blocking_pids, también las que esperan detrás de otra espera), en vez de dormir un tiempo fijo.
export type Conexion = Awaited<ReturnType<typeof connect>>;

/** Abre una conexión desechable; `pid` es su proceso en Postgres. Siempre hace rollback al terminar. */
export async function conPg<T>(fn: (c: Conexion, pid: number) => Promise<T>): Promise<T> {
  const c = await connect();
  try {
    const { rows } = await c.query('select pg_backend_pid() as pid');
    return await fn(c, rows[0].pid as number);
  } finally {
    await c.query('rollback').catch(() => undefined);
    await c.end();
  }
}

const bloqueadosPor = (pid: number) =>
  owner<{ n: number }>(
    `with recursive b(pid) as (
       select pid from pg_stat_activity where $1::int = any(pg_blocking_pids(pid))
       union
       select a.pid from pg_stat_activity a join b on b.pid = any(pg_blocking_pids(a.pid))
     ) select count(*)::int n from b`,
    [pid],
  ).then((r) => r[0].n);

/** Espera (hasta `limiteMs`) a que al menos `n` sesiones de Postgres estén bloqueadas por `pid`; falla si no llegan. Devuelve cuántas peticiones de `pendientes` ya terminaron (debe ser 0). */
export async function esperarBloqueados(pid: number, n: number, pendientes: Array<Promise<unknown>> = [], limiteMs = 15_000): Promise<number> {
  let terminadas = 0;
  for (const p of pendientes) void p.then(() => terminadas++, () => terminadas++);
  const hasta = Date.now() + limiteMs;
  while ((await bloqueadosPor(pid)) < n) {
    if (Date.now() > hasta) throw new Error(`nadie quedó bloqueado por el proceso ${pid} (se esperaban ${n})`);
    await new Promise((r) => setTimeout(r, 40));
  }
  return terminadas;
}
