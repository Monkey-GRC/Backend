import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import type { ControlAccess } from '../controls/control-access';
import type { TestState } from '../engine/states';
import type { ReviewerRole } from '../evidence/evidence';
import type { VerdictDecision, VerdictResult, VerdictReview, VerdictState } from './test-verdict';

// El veredicto de un test manual que no es documental (contracts/cumplimiento/veredictos.md, D85, D121). Es del test en el servicio y cuenta en todos los controles que lo llevan, pero
// solo cuando está aprobado: el motor lee el ÚLTIMO veredicto del test en el servicio (`test_verdicts`), no filas de `evaluations`.

export type VerdictPerson = { id: string; name: string; lastName: string };

export type VerdictRecord = {
  id: string;
  /** El control de origen: desde el que se registró. */
  controlId: string;
  testId: string;
  dimension: string;
  result: VerdictResult;
  note: string | null;
  closureObservationReason: string | null;
  registeredBy: VerdictPerson & { role: string };
  registeredAt: Date;
  /** Se deriva de las revisiones. */
  state: VerdictState;
  /** A lo sumo una por rol (el del dueño y el del admin_empresa). */
  reviews: VerdictReview[];
  /** Los controles vigentes del servicio que llevan el test: donde cuenta, si está aprobado (D85). */
  appliesToControls: Array<{ id: string; code: string }>;
};

/** El veredicto más reciente APROBADO de un test, visto desde un control (sin la nota: la nota es del historial). */
export type LastVerdict = { result: VerdictResult; evaluatedAt: Date; confirmedBy: VerdictPerson };

/** Con el estado del test en el control de origen tras el cambio. */
export type VerdictWithTestState = VerdictRecord & { testState: TestState };

/** Dónde se registraría un veredicto y a quién le toca el control: lo que hace falta para decidir si una persona puede actuar. */
export type VerdictOrigin = { serviceId: string; active: boolean; dimension: string; access: ControlAccess };

export type NewVerdict = {
  result: VerdictResult;
  note: string | null;
  closureObservationReason: string | null;
  registeredBy: string;
  /** Lo registra el admin_empresa: nace con su aprobación y cuenta al instante (P34). */
  approvedAtBirth: boolean;
  meta: { ipAddress: string; userAgent: string };
};

export type NewVerdictReview = {
  reviewerRole: ReviewerRole;
  decision: VerdictDecision;
  note: string | null;
  reviewedBy: string;
  meta: { ipAddress: string; userAgent: string };
};

/** Lo que cambió al revisar: la revisión anterior del mismo rol (si la había), la nueva y el estado del veredicto antes, para el rastro. */
export type VerdictReviewed = { verdict: VerdictWithTestState; before: VerdictReview | null; after: VerdictReview; stateBefore: VerdictState };

export abstract class TestVerdictRepository {
  /** Dónde está el control y a quién le toca. `null` si el control no existe para esta empresa o no lleva el test. */
  abstract originOf(scope: TenantScope, controlId: string, testId: string): Promise<VerdictOrigin | null>;

  /**
   * Registra el veredicto con su rastro en la misma transacción (SEG-36) y deja el evento de cada control cuyo estado se mueva (D91). `null` si el control no existe para esta empresa o no
   * lleva el test. Lanza `CONTROL_RETIRED`, `TEST_DECIDED_BY_EVIDENCE` (documental), `TEST_NOT_MANUAL`, `TEST_HAS_NO_ASSETS` y `closure_reason.required`.
   */
  abstract issue(scope: TenantScope, controlId: string, testId: string, input: NewVerdict, audit: AuditIntent<VerdictWithTestState>): Promise<VerdictWithTestState | null>;

  /** El veredicto con a quién le toca su control de origen y si ya hay uno más nuevo del test en el servicio. `null` si no existe para esta empresa. */
  abstract findForReview(scope: TenantScope, verdictId: string): Promise<{ verdict: VerdictRecord; access: ControlAccess; superseded: boolean } | null>;

  /**
   * Crea o reemplaza la revisión de ESE rol, con su rastro en la misma transacción, y deja el evento de cada control cuyo estado se mueva. `null` si no existe para esta empresa.
   * Lanza `VERDICT_SUPERSEDED` si mientras tanto se registró uno más nuevo.
   */
  abstract saveReview(scope: TenantScope, verdictId: string, input: NewVerdictReview, audit: AuditIntent<VerdictReviewed>): Promise<VerdictReviewed | null>;

  /** El último veredicto APROBADO de cada test de un control: test → veredicto. Un test sin veredicto aprobado no aparece. */
  abstract latestByControl(scope: TenantScope, controlId: string): Promise<Map<string, LastVerdict>>;

  /** El historial del test en el servicio visto desde un control, del más reciente al más antiguo. `null` si el control no existe o no lleva el test. */
  abstract list(scope: TenantScope, controlId: string, testId: string, page: number, pageSize: number): Promise<{ page: Page<VerdictRecord>; access: ControlAccess } | null>;
}
