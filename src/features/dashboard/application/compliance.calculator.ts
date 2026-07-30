import { ChecklistOs } from 'generated/prisma-tenant/browser';
import { ControlWithChecks } from '../domain/repositories/control-compliance.repository';
import { ScaCheckResult } from '../domain/repositories/sca-result.repository';

export type ControlCompliance = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  compliance: number | null;
  checksTotal: number;
  checksPassed: number;
  checksFailed: number;
  checksNotApplicable: number;
};

export function computeControlCompliance(
  control: ControlWithChecks,
  resultsByOs: Map<ChecklistOs, Map<string, ScaCheckResult>>,
): ControlCompliance {
  let passed = 0;
  let failed = 0;
  let notApplicable = 0;

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

  const applicable = passed + failed;

  return {
    id: control.id,
    code: control.code,
    name: control.name,
    description: control.description,
    compliance:
      applicable === 0 ? null : Math.round((passed / applicable) * 10000) / 100,
    checksTotal: control.checks.length,
    checksPassed: passed,
    checksFailed: failed,
    checksNotApplicable: notApplicable,
  };
}
