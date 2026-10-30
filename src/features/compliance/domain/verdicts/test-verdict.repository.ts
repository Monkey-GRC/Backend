import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import type { TestState } from '../engine/states';

// El veredicto de un test manual que no es documental (contracts/modules/compliance-audit.md, MD-155, D85). Lo da el admin_empresa (D96). Es del test en el servicio: queda una evaluación
// inmutable por cada control del servicio que lleva el test y por cada activo de su dimensión, y cuenta en todos ellos.

export type VerdictResult = 'compliant' | 'non_compliant';

export type VerdictRecord = {
  /** La evaluación del control de origen y del primer activo; las demás filas de este mismo veredicto comparten quién, cuándo y qué. */
  id: string;
  controlId: string;
  testId: string;
  dimension: string;
  result: VerdictResult;
  note: string | null;
  closureObservationReason: string | null;
  confirmedBy: { id: string; name: string; lastName: string };
  evaluatedAt: Date;
  appliesToControls: Array<{ id: string; code: string }>;
};

/** El veredicto más reciente de un test manual en un control (sin la nota: la nota es del historial). */
export type LastVerdict = { result: VerdictResult; evaluatedAt: Date; confirmedBy: { id: string; name: string; lastName: string } };

export type VerdictIssued = VerdictRecord & { testState: TestState };

export type NewVerdict = {
  result: VerdictResult;
  note: string | null;
  closureObservationReason: string | null;
  confirmedBy: string;
  meta: { ipAddress: string; userAgent: string };
};

export abstract class TestVerdictRepository {
  /**
   * Registra el veredicto con su rastro en la misma transacción (SEG-36) y deja el evento de cada control cuyo estado se mueva (D91). `null` si el control no existe para esta
   * empresa o no lleva el test. Lanza `CONTROL_RETIRED`, `TEST_DECIDED_BY_EVIDENCE` (documental), `TEST_NOT_MANUAL` y `TEST_HAS_NO_ASSETS`.
   */
  abstract issue(scope: TenantScope, controlId: string, testId: string, input: NewVerdict, audit: AuditIntent<VerdictIssued>): Promise<VerdictIssued | null>;

  /** El último veredicto de cada test manual de un control: test → veredicto. Un test sin veredicto no aparece. */
  abstract latestByControl(scope: TenantScope, controlId: string): Promise<Map<string, LastVerdict>>;

  /** El historial del test visto desde un control, del más reciente al más antiguo. `null` si el control no existe o no lleva el test. */
  abstract list(scope: TenantScope, controlId: string, testId: string, page: number, pageSize: number): Promise<Page<VerdictRecord> | null>;
}
