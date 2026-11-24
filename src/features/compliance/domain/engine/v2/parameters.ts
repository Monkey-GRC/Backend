// Parámetros del motor (§9 «Los parámetros», RC-19): nunca se escriben dentro de la lógica. Las funciones del motor los reciben; el puerto los entrega.
// Todos los clientes comparten el mismo valor (D140); MD-495 reemplaza la implementación por una tabla.
export type EvaluationParameters = {
  /** PR-01 · C% mínimo para Parcial. */
  partialThreshold: number;
  /** PR-02 · C% mínimo para Débil. */
  weakThreshold: number;
  /** PR-03 · Cobertura de activos exigida en una prueba técnica (%). */
  assetCoverage: number;
  /** PR-04 · Duración máxima de la excepción de un check (días). */
  checkExceptionMaxDays: number;
  /** PR-05 · Frescura máxima de un resultado automático (horas). */
  freshnessHours: number;
  /** D146 · Puntaje mínimo (%) para que pase un vínculo de puntaje global. */
  scoreThreshold: number;
};

export abstract class EvaluationParametersPort {
  abstract load(): Promise<EvaluationParameters>;
}
