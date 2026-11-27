import { ExecutionSummary } from '../domain/repositories/scan.repository';
import { Finding } from '../domain/scan/findings';
import { AssetReadiness, READINESS_AREAS } from '../domain/scan/readiness';

const iso = (d: Date | null) => (d ? d.toISOString() : null);

type Translate = (key: string) => string;

export const toExecutionResponse = (e: ExecutionSummary, t: Translate = (k) => k) => ({
  id: e.id,
  status: e.status,
  origin: e.origin,
  queued_at: iso(e.queuedAt),
  started_at: iso(e.startedAt),
  finished_at: iso(e.finishedAt),
  // El avance REAL mientras corre, si esa evaluación lo informa; si no, `null` (la pantalla lo estima por tiempo y lo dice).
  progress_percent: e.status === 'running' && e.progressPercentage > 0 ? e.progressPercentage : null,
  mail_reviewed: e.mailReviewed,
  // Clave i18n de por qué falló y su texto ya traducido (la plataforma no tiene i18n propio); nunca el texto del motor.
  failure_reason: e.failureReason,
  failure_message: e.failureReason ? t(e.failureReason) : null,
});

type ReadinessView = AssetReadiness & { executionId: string; measuredAt: Date | null; includesProposedMappings: boolean };

// Lo que ve el cliente por defecto: cualitativo primero, cobertura y cumplimiento como dos números aparte, sin porcentaje consolidado y sin
// códigos de control ni de requisito (philosophy.md). `includes_proposed_mappings` es honestidad: si es true, parte de lo medido se apoya en
// vínculos que el comité aún no ratificó.
export const toReadinessResponse = (assetId: string, r: ReadinessView | null) =>
  r
    ? {
        asset_id: assetId,
        readiness: r.readiness,
        measured_at: iso(r.measuredAt),
        includes_proposed_mappings: r.includesProposedMappings,
        coverage: r.coverage,
        of_measured: { compliant: r.ofMeasured.compliant, not_compliant: r.ofMeasured.notCompliant },
        areas: r.areas.map((a) => ({ area: a.area, readiness: a.readiness, open_findings: a.openFindings, not_measured: a.notMeasured })),
        needs_manual_review: r.needsManualReview,
      }
    : {
        // Aún no hay ninguna corrida completada: es un hueco de cobertura, no un fallo.
        asset_id: assetId,
        readiness: 'not_measured',
        measured_at: null,
        includes_proposed_mappings: false,
        coverage: { measured: 0, expected: 0 },
        of_measured: { compliant: 0, not_compliant: 0 },
        areas: READINESS_AREAS.map((area) => ({ area, readiness: 'not_measured', open_findings: 0, not_measured: 0 })),
        needs_manual_review: 0,
      };

export const toFindingResponse = (f: Finding) => ({
  id: f.id,
  title: f.title,
  severity: f.severity,
  resources: f.resources,
  resources_total: f.resourcesTotal,
  remediation: f.remediation ? { text: f.remediation.text, language: f.remediation.language, is_ai_generated: f.remediation.isAiGenerated } : null,
});