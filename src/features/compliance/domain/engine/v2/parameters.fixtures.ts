import type { EvaluationParameters } from './parameters';

// SOLO PARA PRUEBAS · Los valores del libro (§9 «Los parámetros») tal como los siembra la migración de `catalog.evaluation_parameters`. La producción no los tiene en código: los lee de la tabla.
export const BOOK_PARAMETERS: EvaluationParameters = {
  partialThreshold: 75,
  weakThreshold: 40,
  assetCoverage: 100,
  checkExceptionMaxDays: 90,
  freshnessHours: 24,
  scoreThreshold: 80,
  alertDaysBefore: { daily: 0, weekly: 2, monthly: 5, bimonthly: 10, quarterly: 15, semiannual: 20, annual: 30 },
  onDemandAlertDays: 15,
  auditedPeriodMinMonths: 6,
  solidAssetCoverage: 100,
  validityWindows: 'calendar',
  riskPartialMitigationCoverage: 60,
  riskDemonstratedMitigationCoverage: 85,
  impactReductionEnabled: false,
  approvalMaxSteps: 5,
  approvalMaxApproversPerStep: 3,
  submitterSoleApproverAllowed: false,
  documentAcceptanceDays: 30,
  documentAcceptanceRequired: 100,
};
