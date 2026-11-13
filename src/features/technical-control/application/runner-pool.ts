// Grupo de trabajadores de ESTE backend (D112). Un backend solo entrega a su trabajador las ejecuciones de su grupo, para que quien prueba en local
// con la base compartida de desarrollo no se las lleve el trabajador del servidor (ni al revés). En producción puede omitirse: queda `default`.
export const RUNNER_POOL = Symbol('RUNNER_POOL');
export const DEFAULT_RUNNER_POOL = 'default';

export function readRunnerPool(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return DEFAULT_RUNNER_POOL;
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(value)) throw new Error('RUNNER_POOL inválido: usa minúsculas, dígitos y guiones (máximo 40 caracteres), p. ej. local-rod.');
  return value;
}
