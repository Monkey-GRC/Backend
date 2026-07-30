import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { ChecklistOs } from 'generated/prisma-tenant/browser';
import { CisCheckRepository, CisChecklistItem } from '../../domain/repositories/cis-check.repository';

const POLICY_ID_BY_OS: Record<ChecklistOs, string> = {
    [ChecklistOs.UBUNTU]: 'cis_ubuntu22-04',
    [ChecklistOs.WINDOWS]: 'cis_win11_enterprise',
};

@Injectable()
export class CisCheckPgRepository extends CisCheckRepository implements OnModuleDestroy {
    private readonly pool = new Pool({ connectionString: process.env.WAZUH_DATABASE_URL });

    async findByOs(os: ChecklistOs, search?: string): Promise<CisChecklistItem[]> {
        const policyId = POLICY_ID_BY_OS[os];
        const values: unknown[] = [policyId];
        let where = 'policy_id = $1';

        if (search) {
            values.push(`%${search}%`);
            where += ` AND title ILIKE $${values.length}`;
        }

        const { rows } = await this.pool.query<{ check_id: string; title: string }>(
            `SELECT check_id, title FROM cis_checks WHERE ${where} ORDER BY check_id`,
            values,
        );

        return rows.map((row) => ({ checkId: row.check_id, title: row.title }));
    }

    onModuleDestroy() {
        return this.pool.end();
    }
}
