import { ChecklistOs, ControlDimension, ControlType, ManualCheckStatus } from 'generated/prisma-tenant/browser';

export type ControlCheckItem = {
  checkId: string;
  title: string;
  os: ChecklistOs;
  dimension: ControlDimension;
};

export type ManualCheckStatusItem = {
  id: string;
  status: ManualCheckStatus;
  dimension: ControlDimension;
};

export type DimensionRequirement = {
  dimension: ControlDimension;
  type: ControlType;
};

export type ControlWithChecks = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: ControlType;
  checks: ControlCheckItem[];
  manualChecks: ManualCheckStatusItem[];
  /** Qué dimensiones aplican a este control — ver ControlDimensionRequirement. */
  dimensionRequirements: DimensionRequirement[];
};

export abstract class ControlComplianceRepository {
  /**
   * Todos los controles (AUTOMATIC, MANUAL, HYBRID) — el dashboard evalúa el
   * framework completo, no solo lo técnico. Si se pasa `templateId`, se
   * limita a los controles de ESE template (vía Risk->Reason->Control) — un
   * tenant puede tener más de un framework adoptado (ej. SOC 2 + ISO 27001),
   * y mezclarlos sin filtrar da un % de cumplimiento sin sentido.
   */
  abstract findControlsWithChecks(templateId?: string): Promise<ControlWithChecks[]>;
}
