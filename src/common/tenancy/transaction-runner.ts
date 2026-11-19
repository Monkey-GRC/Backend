import { TenantScope } from './tenant-scope';

// Transacción del caso de uso: todo repositorio que se llame dentro de `fn` con el mismo scope comparte UNA transacción
// (una sola apertura, un solo set_config, un solo rollback). Fuera de `run`, cada repositorio abre la suya como siempre.
// Dentro de `fn` las consultas van en serie, nunca en paralelo.
export abstract class TransactionRunner {
  abstract run<T>(scope: TenantScope, fn: () => Promise<T>, options?: { timeoutMs?: number }): Promise<T>;
}
