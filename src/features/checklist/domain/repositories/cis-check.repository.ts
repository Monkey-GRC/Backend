import { ChecklistOs } from 'generated/prisma/browser';

export type CisChecklistItem = {
    checkId: string;
    title: string;
};

export abstract class CisCheckRepository {
    abstract findByOs(os: ChecklistOs, search?: string): Promise<CisChecklistItem[]>;
}
