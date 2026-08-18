import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { RequestContext } from 'src/common/utils/request-context';
import {
    AddManualCheckEvidenceInput,
    CreateManualCheckInput,
    ManualCheckEvidenceRecord,
    ManualCheckItemRecord,
    ManualCheckRepository,
    SetManualCheckStatusInput,
    UpdateManualCheckInput,
} from '../../domain/repositories/manual-check.repository';

const USER_SUMMARY_SELECT = { id: true, name: true, last_name: true, username: true } as const;

const ITEM_SELECT = {
    id: true,
    control_id: true,
    title: true,
    description: true,
    remediation: true,
    status: true,
    notes: true,
    evaluated_at: true,
    evaluated_by_user: { select: USER_SUMMARY_SELECT },
    created_at: true,
    updated_at: true,
    evidence: {
        select: {
            id: true,
            file_name: true,
            mime_type: true,
            size_bytes: true,
            storage_key: true,
            uploaded_at: true,
            uploaded_by_user: { select: USER_SUMMARY_SELECT },
        },
        orderBy: { uploaded_at: 'desc' as const },
    },
} as const;

function mapEvidence(row: any): ManualCheckEvidenceRecord {
    return {
        id: row.id,
        fileName: row.file_name,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        storageKey: row.storage_key,
        uploadedAt: row.uploaded_at,
        uploadedBy: row.uploaded_by_user,
    };
}

function mapItem(row: any): ManualCheckItemRecord {
    return {
        id: row.id,
        controlId: row.control_id,
        title: row.title,
        description: row.description,
        remediation: row.remediation,
        status: row.status,
        notes: row.notes,
        evaluatedAt: row.evaluated_at,
        evaluatedBy: row.evaluated_by_user,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        evidence: row.evidence.map(mapEvidence),
    };
}

@Injectable()
export class ManualCheckPrismaRepository extends ManualCheckRepository {
    constructor(
        private readonly centralPrisma: CentralPrismaService,
        private readonly tenantConnection: TenantConnectionManager,
    ) {
        super();
    }

    private db(): Promise<any> {
        const tenantId = RequestContext.clientId;
        return tenantId ? this.tenantConnection.getClientFor(tenantId) : Promise.resolve(this.centralPrisma);
    }

    async findControlType(controlId: string) {
        const db = await this.db();
        return db.control.findUnique({ where: { id: controlId }, select: { id: true, type: true } });
    }

    async create(input: CreateManualCheckInput): Promise<ManualCheckItemRecord> {
        const db = await this.db();
        const row = await db.manualCheckItem.create({
            data: {
                control_id: input.controlId,
                title: input.title,
                description: input.description,
                remediation: input.remediation,
                created_by: input.userId,
            },
            select: ITEM_SELECT,
        });
        return mapItem(row);
    }

    async findAllByControl(controlId: string): Promise<ManualCheckItemRecord[]> {
        const db = await this.db();
        const rows = await db.manualCheckItem.findMany({
            where: { control_id: controlId },
            select: ITEM_SELECT,
            orderBy: { seq: 'asc' },
        });
        return rows.map(mapItem);
    }

    async findOne(id: string): Promise<ManualCheckItemRecord | null> {
        const db = await this.db();
        const row = await db.manualCheckItem.findUnique({ where: { id }, select: ITEM_SELECT });
        return row ? mapItem(row) : null;
    }

    async update(id: string, input: UpdateManualCheckInput): Promise<ManualCheckItemRecord> {
        const db = await this.db();
        const data: Record<string, any> = {};
        if (input.title !== undefined) data['title'] = input.title;
        if (input.description !== undefined) data['description'] = input.description;
        if (input.remediation !== undefined) data['remediation'] = input.remediation;

        const row = await db.manualCheckItem.update({ where: { id }, data, select: ITEM_SELECT });
        return mapItem(row);
    }

    async setStatus(id: string, input: SetManualCheckStatusInput): Promise<ManualCheckItemRecord> {
        const db = await this.db();
        const row = await db.manualCheckItem.update({
            where: { id },
            data: {
                status: input.status,
                notes: input.notes,
                evaluated_at: new Date(),
                evaluated_by: input.userId,
            },
            select: ITEM_SELECT,
        });
        return mapItem(row);
    }

    async delete(id: string): Promise<void> {
        const db = await this.db();
        await db.manualCheckItem.delete({ where: { id } });
    }

    async addEvidence(input: AddManualCheckEvidenceInput): Promise<ManualCheckEvidenceRecord> {
        const db = await this.db();
        const row = await db.manualCheckEvidence.create({
            data: {
                manual_check_id: input.manualCheckId,
                file_name: input.fileName,
                mime_type: input.mimeType,
                size_bytes: input.sizeBytes,
                storage_key: input.storageKey,
                uploaded_by: input.userId,
            },
            select: {
                id: true,
                file_name: true,
                mime_type: true,
                size_bytes: true,
                storage_key: true,
                uploaded_at: true,
                uploaded_by_user: { select: USER_SUMMARY_SELECT },
            },
        });
        return mapEvidence(row);
    }

    async findEvidence(evidenceId: string) {
        const db = await this.db();
        const row = await db.manualCheckEvidence.findUnique({
            where: { id: evidenceId },
            select: {
                id: true,
                manual_check_id: true,
                file_name: true,
                mime_type: true,
                size_bytes: true,
                storage_key: true,
                uploaded_at: true,
                uploaded_by_user: { select: USER_SUMMARY_SELECT },
            },
        });
        if (!row) return null;
        return { ...mapEvidence(row), manualCheckId: row.manual_check_id };
    }

    async deleteEvidence(evidenceId: string): Promise<void> {
        const db = await this.db();
        await db.manualCheckEvidence.delete({ where: { id: evidenceId } });
    }
}
