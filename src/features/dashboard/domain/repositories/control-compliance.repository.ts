import { ChecklistOs } from 'generated/prisma/browser';

export type ControlCheckItem = {
  checkId: string;
  title: string;
  os: ChecklistOs;
};

export type ControlWithChecks = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  checks: ControlCheckItem[];
};

export abstract class ControlComplianceRepository {
  abstract findAutomaticControlsWithChecks(): Promise<ControlWithChecks[]>;
}
