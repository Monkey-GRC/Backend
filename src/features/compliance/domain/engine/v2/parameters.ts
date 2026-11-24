// Parámetros del motor (§9 «Los parámetros», RC-19): nunca se escriben dentro de la lógica. Las funciones del motor los reciben; el puerto los entrega.
// Todos los clientes comparten el mismo valor (D140); MD-495 reemplaza la implementación por una tabla.
import type { Periodicity } from './types';

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
  /** PR-06 · Días de aviso previo al cierre de una ventana, por periodicidad (la anual, 30; la diaria, el mismo día). */
  alertDaysBefore: Partial<Record<Periodicity, number>>;
  /** PR-06 · «Cuando sea requerido»: días antes del cierre del trimestre para pedir la declaración. */
  onDemandAlertDays: number;
  /** PR-16 · Duración mínima (meses) del período auditado de SOC 2. */
  auditedPeriodMinMonths: number;
  /** Sólido (R5/R6) · Cobertura de activos (%) que exige un control Sólido en sus pruebas técnicas. */
  solidAssetCoverage: number;
};

export abstract class EvaluationParametersPort {
  abstract load(): Promise<EvaluationParameters>;
}
