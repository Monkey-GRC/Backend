import { ChecklistOs } from 'generated/prisma-tenant/browser';

export type ScaCheckResult = 'passed' | 'failed' | 'not_applicable';

export abstract class ScaResultRepository {
  abstract findAggregatedResultsByOs(
    os: ChecklistOs,
  ): Promise<Map<string, ScaCheckResult>>;
}
