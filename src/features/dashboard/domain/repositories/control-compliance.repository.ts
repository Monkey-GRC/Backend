import { ChecklistOs, ControlType, ManualCheckStatus } from 'generated/prisma-tenant/browser';

export type ControlCheckItem = {
  checkId: string;
  title: string;
  os: ChecklistOs;
};

export type ManualCheckStatusItem = {
  id: string;
  status: ManualCheckStatus;
};

export type ControlWithChecks = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: ControlType;
  checks: ControlCheckItem[];
  manualChecks: ManualCheckStatusItem[];
};

export abstract class ControlComplianceRepository {
  /** Todos los controles (AUTOMATIC, MANUAL, HYBRID) — el dashboard evalúa el framework completo, no solo lo técnico. */
  abstract findControlsWithChecks(): Promise<ControlWithChecks[]>;
}
