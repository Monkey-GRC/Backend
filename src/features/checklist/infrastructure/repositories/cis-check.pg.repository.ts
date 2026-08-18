import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { ChecklistOs } from 'generated/prisma-tenant/browser';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { CisCheckDetail, CisCheckRepository, CisChecklistItem } from '../../domain/repositories/cis-check.repository';

const POLICY_ID_BY_OS: Record<ChecklistOs, string> = {
    [ChecklistOs.UBUNTU]: 'cis_ubuntu22-04',
    [ChecklistOs.WINDOWS]: 'cis_win11_enterprise',
};

type TranslationFields = { title_es: string; description_es: string | null; rationale_es: string | null; remediation_es: string | null };

/**
 * `cis_checks` es una tabla externa (catálogo CIS de Wazuh, contenido de
 * referencia de un tercero, en inglés) — no la traducimos in situ. La
 * traducción vive en `mnk_cis_check_translations` (central, independiente de
 * tenant: un check_id significa lo mismo para cualquier cliente) y se aplica
 * como una capa por encima; si un check_id no tiene traducción todavía, se
 * muestra en inglés.
 */
@Injectable()
export class CisCheckPgRepository extends CisCheckRepository implements OnModuleDestroy {
    private readonly pool = new Pool({ connectionString: process.env.WAZUH_DATABASE_URL });

    constructor(private readonly centralPrisma: CentralPrismaService) {
        super();
    }

    private async findTranslations(checkIds: string[]): Promise<Map<string, TranslationFields>> {
        const map = new Map<string, TranslationFields>();
        if (!checkIds.length) return map;

        const rows = await this.centralPrisma.cisCheckTranslation.findMany({
            where: { check_id: { in: checkIds } },
        });
        for (const row of rows) {
            map.set(row.check_id, {
                title_es: row.title_es,
                description_es: row.description_es,
                rationale_es: row.rationale_es,
                remediation_es: row.remediation_es,
            });
        }
        return map;
    }

    async findByOs(os: ChecklistOs, search?: string): Promise<CisChecklistItem[]> {
        const policyId = POLICY_ID_BY_OS[os];
        const values: unknown[] = [policyId];
        let where = 'policy_id = $1';

        if (search) {
            values.push(`%${search}%`);
            where += ` AND title ILIKE $${values.length}`;
        }

        const { rows } = await this.pool.query<{
            check_id: string;
            title: string;
            description: string | null;
            rationale: string | null;
            remediation: string | null;
            soc2_code: string | null;
        }>(
            `SELECT check_id, title, description, rationale, remediation, soc2_code
             FROM cis_checks WHERE ${where} ORDER BY check_id`,
            values,
        );

        const translations = await this.findTranslations(rows.map((row) => row.check_id));

        return rows.map((row) => {
            const es = translations.get(row.check_id);
            return {
                checkId: row.check_id,
                title: es?.title_es ?? row.title,
                description: es?.description_es ?? row.description,
                rationale: es?.rationale_es ?? row.rationale,
                remediation: es?.remediation_es ?? row.remediation,
                soc2Code: row.soc2_code,
            };
        });
    }

    async findDetailsByCheckIds(checkIds: string[]): Promise<Map<string, CisCheckDetail>> {
        const map = new Map<string, CisCheckDetail>();
        if (!checkIds.length) return map;

        const { rows } = await this.pool.query<{
            check_id: string;
            title: string;
            description: string | null;
            rationale: string | null;
            remediation: string | null;
            soc2_code: string | null;
        }>(
            `SELECT check_id, title, description, rationale, remediation, soc2_code
             FROM cis_checks WHERE check_id = ANY($1::text[])`,
            [checkIds],
        );

        const translations = await this.findTranslations(rows.map((row) => row.check_id));

        for (const row of rows) {
            const es = translations.get(row.check_id);
            map.set(row.check_id, {
                checkId: row.check_id,
                title: es?.title_es ?? row.title,
                description: es?.description_es ?? row.description,
                rationale: es?.rationale_es ?? row.rationale,
                remediation: es?.remediation_es ?? row.remediation,
                soc2Code: row.soc2_code,
            });
        }
        return map;
    }

    onModuleDestroy() {
        return this.pool.end();
    }
}
