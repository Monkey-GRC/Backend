// Parámetros del motor (§9 «Los parámetros», RC-19): nunca se escriben dentro de la lógica. Las funciones del motor los reciben; el puerto los entrega.
// Los lee quien los necesita sin conocer a los demás: el motor de `compliance` y los plazos de Documentos (PR-14). Todos los clientes comparten el mismo valor (D140). Viven en `catalog.evaluation_parameters` (MD-495): la semilla de la migración es el único lugar con los números.
import type { WindowMode } from './parameter-definitions';

export type Periodicity = 'permanent' | 'daily' | 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual' | 'on_demand';

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
  /** PR-07 · `calendar`: la ventana es el período de calendario · `rolling`: cada evidencia vale una periodicidad desde su fecha. */
  validityWindows: WindowMode;
  /** PR-08 · Cobertura (%) de mitigación para un riesgo «Parcialmente mitigado» (aún no lo lee el motor). */
  riskPartialMitigationCoverage: number;
  /** PR-09 · Cobertura (%) de mitigación para un riesgo «Mitigación demostrada» (aún no lo lee el motor). */
  riskDemonstratedMitigationCoverage: number;
  /** PR-10 · Reducción de impacto del riesgo. */
  impactReductionEnabled: boolean;
  /** PR-11 · Máximo de pasos de una aprobación de documento. */
  approvalMaxSteps: number;
  /** PR-12 · Máximo de aprobadores por paso. */
  approvalMaxApproversPerStep: number;
  /** PR-13 · Quien envía puede ser el único aprobador. */
  submitterSoleApproverAllowed: boolean;
  /** PR-14 · Días para aceptar un documento publicado. */
  documentAcceptanceDays: number;
  /** PR-15 · Porcentaje de usuarios que deben aceptar un documento. */
  documentAcceptanceRequired: number;
};

/** La sesión de base de datos abierta por el caso de uso (la transacción con la empresa). La carga se hace dentro de ella: no pide otra conexión. */
export type ParametersSession = object;

export abstract class EvaluationParametersPort {
  /** Una consulta, sin caché: cada caso de uso la llama UNA vez y pasa el resultado hacia abajo. */
  abstract load(session: ParametersSession): Promise<EvaluationParameters>;
}
