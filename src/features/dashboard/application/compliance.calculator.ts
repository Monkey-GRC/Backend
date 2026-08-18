import { ChecklistOs, ControlType } from 'generated/prisma-tenant/browser';
import { ControlWithChecks } from '../domain/repositories/control-compliance.repository';
import { ScaCheckResult } from '../domain/repositories/sca-result.repository';

export type ControlCompliance = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: ControlType;
  /**
   * Null cuando el control no tiene ningún check evaluado todavía (todos
   * PENDING/NOT_APPLICABLE, o sin checks configurados) — cobertura, no
   * cumplimiento. Ver checksPending.
   */
  compliance: number | null;
  checksTotal: number;
  checksPassed: number;
  checksFailed: number;
  checksNotApplicable: number;
  /** Checks manuales sin evaluar todavía (nadie los ha marcado como cumple/falla/no aplica). */
  checksPending: number;
};

export function computeControlCompliance(
  control: ControlWithChecks,
  resultsByOs: Map<ChecklistOs, Map<string, ScaCheckResult>>,
): ControlCompliance {
  let passed = 0;
  let failed = 0;
  let notApplicable = 0;
  let pending = 0;

  for (const check of control.checks) {
    const result =
      resultsByOs.get(check.os)?.get(check.checkId) ?? 'not_applicable';
    if (result === 'passed') {
      passed += 1;
    } else if (result === 'failed') {
      failed += 1;
    } else {
      notApplicable += 1;
    }
  }

  for (const check of control.manualChecks) {
    switch (check.status) {
      case 'PASSED':
        passed += 1;
        break;
      case 'FAILED':
        failed += 1;
        break;
      case 'NOT_APPLICABLE':
        notApplicable += 1;
        break;
      default:
        pending += 1;
    }
  }

  const applicable = passed + failed;

  return {
    id: control.id,
    code: control.code,
    name: control.name,
    description: control.description,
    type: control.type,
    compliance:
      applicable === 0 ? null : Math.round((passed / applicable) * 10000) / 100,
    checksTotal: control.checks.length + control.manualChecks.length,
    checksPassed: passed,
    checksFailed: failed,
    checksNotApplicable: notApplicable,
    checksPending: pending,
  };
}
