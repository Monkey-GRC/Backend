import { ChecklistOs, ControlType } from 'generated/prisma-tenant/browser';

export type ControlChecklistItemInput = {
    checkId: string;
    title: string;
    soc2Code?: string | null;
    cisCode?: string | null;
    pciDssCode?: string | null;
    soc2CodeInferred?: string | null;
    soc2MappingSource?: string | null;
    soc2MappingConfidence?: string | null;
    soc2MappingCitation?: string | null;
};

export type CreateControlInput = {
    name: string;
    description?: string;
    objective?: string;
    type?: ControlType;
    os?: ChecklistOs;
    checklist?: ControlChecklistItemInput[];
    userId: string;
};

export type UpdateControlInput = {
    name?: string;
    description?: string;
    objective?: string;
    type?: ControlType;
    userId: string;
};

export abstract class ControlRepository {
    abstract findAll(): Promise<any[]>;
    abstract findOne(id: string): Promise<any>;
    abstract create(input: CreateControlInput): Promise<any>;
    abstract update(id: string, input: UpdateControlInput): Promise<any>;
    abstract delete(id: string): Promise<any>;
}
