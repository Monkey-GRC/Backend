import { Client } from 'pg';

// Cuenta lo que llega a Postgres (cada viaje a la base cuesta una latencia): sentencias y transacciones (BEGIN) de una llamada.
export type Consultas = { sentencias: string[]; total: number; transacciones: number };

export async function contarConsultas(llamada: () => PromiseLike<unknown>): Promise<Consultas> {
  const original = Client.prototype.query;
  const sentencias: string[] = [];
  (Client.prototype as any).query = function (this: Client, ...args: any[]) {
    const first = args[0];
    sentencias.push(typeof first === 'string' ? first : (first?.text ?? ''));
    return (original as any).apply(this, args);
  };
  try {
    await llamada();
  } finally {
    Client.prototype.query = original;
  }
  return { sentencias, total: sentencias.length, transacciones: sentencias.filter((s) => /^\s*BEGIN/i.test(s)).length };
}
