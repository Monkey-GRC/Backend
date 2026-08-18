import { ManualCheckStatus } from 'generated/prisma-tenant/browser';

export type ManualCheckEvidenceRecord = {
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    uploadedAt: Date;
    uploadedBy: { id: string; name: string | null; last_name: string | null; username: string } | null;
};

export type ManualCheckItemRecord = {
    id: string;
    controlId: string;
    title: string;
    description: string | null;
    remediation: string | null;
    status: ManualCheckStatus;
    notes: string | null;
    evaluatedAt: Date | null;
    evaluatedBy: { id: string; name: string | null; last_name: string | null; username: string } | null;
    createdAt: Date;
    updatedAt: Date;
    evidence: ManualCheckEvidenceRecord[];
};

export type CreateManualCheckInput = {
    controlId: string;
    title: string;
    description?: string;
    remediation?: string;
    userId: string;
};

export type UpdateManualCheckInput = {
    title?: string;
    description?: string;
    remediation?: string;
};

export type SetManualCheckStatusInput = {
    status: ManualCheckStatus;
    notes?: string;
    userId: string;
};

export type AddManualCheckEvidenceInput = {
    manualCheckId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    userId: string;
};

export abstract class ManualCheckRepository {
    abstract findControlType(controlId: string): Promise<{ id: string; type: string } | null>;
    abstract create(input: CreateManualCheckInput): Promise<ManualCheckItemRecord>;
    abstract findAllByControl(controlId: string): Promise<ManualCheckItemRecord[]>;
    abstract findOne(id: string): Promise<ManualCheckItemRecord | null>;
    abstract update(id: string, input: UpdateManualCheckInput): Promise<ManualCheckItemRecord>;
    abstract setStatus(id: string, input: SetManualCheckStatusInput): Promise<ManualCheckItemRecord>;
    abstract delete(id: string): Promise<void>;

    abstract addEvidence(input: AddManualCheckEvidenceInput): Promise<ManualCheckEvidenceRecord>;
    abstract findEvidence(evidenceId: string): Promise<(ManualCheckEvidenceRecord & { manualCheckId: string }) | null>;
    abstract deleteEvidence(evidenceId: string): Promise<void>;
}
