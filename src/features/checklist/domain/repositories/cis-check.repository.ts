import { ChecklistOs } from 'generated/prisma-tenant/browser';

export type CisCheckDetail = {
    checkId: string;
    title: string;
    result?: string | null;
    description?: string | null;
    rationale?: string | null;
    remediation?: string | null;
    soc2Code?: string | null;
    cisCode?: string | null;
    pciDssCode?: string | null;
};

export type CisChecklistItem = CisCheckDetail;

export abstract class CisCheckRepository {
    abstract findByOs(os: ChecklistOs, search?: string): Promise<CisChecklistItem[]>;
    abstract findByCheckIds(os: ChecklistOs, checkIds: string[]): Promise<CisChecklistItem[]>;
    abstract findDetailsByCheckIds(checkIds: string[]): Promise<Map<string, CisCheckDetail>>;
}
