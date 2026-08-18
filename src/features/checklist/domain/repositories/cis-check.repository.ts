import { ChecklistOs } from 'generated/prisma-tenant/browser';

export type CisCheckDetail = {
    checkId: string;
    title: string;
    description: string | null;
    rationale: string | null;
    remediation: string | null;
    soc2Code: string | null;
};

export type CisChecklistItem = CisCheckDetail;

export abstract class CisCheckRepository {
    abstract findByOs(os: ChecklistOs, search?: string): Promise<CisChecklistItem[]>;

    /** Detalle (descripción/rationale/remediación) para un set puntual de check_id, sin filtrar por policy/os. */
    abstract findDetailsByCheckIds(checkIds: string[]): Promise<Map<string, CisCheckDetail>>;
}
