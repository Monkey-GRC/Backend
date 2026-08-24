import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { ChecklistOs } from 'generated/prisma-tenant/browser';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import {
    CisCheckDetail,
    CisCheckRepository,
    CisChecklistItem,
    WazuhAgentInfo,
} from '../../domain/repositories/cis-check.repository';

const POLICY_ID_BY_OS: Record<ChecklistOs, string> = {
    [ChecklistOs.UBUNTU]: 'cis_ubuntu22-04',
    [ChecklistOs.WINDOWS]: 'cis_win11_enterprise',
};

type TranslationFields = {
    title_es: string;
    description_es: string | null;
    rationale_es: string | null;
    remediation_es: string | null;
};

type CisCheckRow = {
    check_id: string;
    title: string;
    result: string | null;
    description: string | null;
    rationale: string | null;
    remediation: string | null;
    soc2_code: string | null;
    cis_code: string | null;
    pci_dss_code: string | null;
    soc2_code_inferred: string | null;
    soc2_mapping_source: string | null;
    soc2_mapping_confidence: string | null;
    soc2_mapping_citation: string | null;
};

const CHECK_COLUMNS =
    'check_id, title, result, description, rationale, remediation, soc2_code, cis_code, pci_dss_code, soc2_code_inferred, soc2_mapping_source, soc2_mapping_confidence, soc2_mapping_citation';

const CATALOG_COLUMNS =
    'check_id, title, description, rationale, remediation, soc2_code, cis_code, pci_dss_code, soc2_code_inferred, soc2_mapping_source, soc2_mapping_confidence, soc2_mapping_citation';

type CisCheckWithAgentResultRow = {
    check_id: string;
    title: string;
    description: string | null;
    rationale: string | null;
    remediation: string | null;
    soc2_code: string | null;
    cis_code: string | null;
    pci_dss_code: string | null;
    soc2_code_inferred: string | null;
    soc2_mapping_source: string | null;
    soc2_mapping_confidence: string | null;
    soc2_mapping_citation: string | null;
    agent_result: string | null;
};

function toChecklistItem(row: CisCheckRow, es?: TranslationFields): CisChecklistItem {
    return {
        checkId: row.check_id,
        title: es?.title_es ?? row.title,
        result: row.result,
        description: es?.description_es ?? row.description,
        rationale: es?.rationale_es ?? row.rationale,
        remediation: es?.remediation_es ?? row.remediation,
        soc2Code: row.soc2_code,
        cisCode: row.cis_code,
        pciDssCode: row.pci_dss_code,
        soc2CodeInferred: row.soc2_code_inferred,
        soc2MappingSource: row.soc2_mapping_source,
        soc2MappingConfidence: row.soc2_mapping_confidence,
        soc2MappingCitation: row.soc2_mapping_citation,
    };
}

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

        const { rows } = await this.pool.query<CisCheckRow>(
            `SELECT ${CHECK_COLUMNS} FROM cis_checks WHERE ${where} ORDER BY check_id`,
            values,
        );

        const translations = await this.findTranslations(rows.map((row) => row.check_id));

        return rows.map((row) => toChecklistItem(row, translations.get(row.check_id)));
    }

    async findByCheckIds(os: ChecklistOs, checkIds: string[]): Promise<CisChecklistItem[]> {
        if (!checkIds.length) {
            return [];
        }
        const policyId = POLICY_ID_BY_OS[os];

        const { rows } = await this.pool.query<CisCheckRow>(
            `SELECT ${CHECK_COLUMNS} FROM cis_checks WHERE policy_id = $1 AND check_id = ANY($2::text[])`,
            [policyId, checkIds],
        );

        return rows.map((row) => toChecklistItem(row));
    }

    async findComplianceForAgent(os: ChecklistOs, agentId: string): Promise<CisChecklistItem[]> {
        const policyId = POLICY_ID_BY_OS[os];

        const { rows } = await this.pool.query<CisCheckWithAgentResultRow>(
            `SELECT c.${CATALOG_COLUMNS.split(', ').join(', c.')}, r.result AS agent_result
             FROM cis_checks c
             LEFT JOIN cis_check_results r
               ON r.policy_id = c.policy_id AND r.check_id = c.check_id AND r.agent_id = $2
             WHERE c.policy_id = $1
             ORDER BY c.check_id`,
            [policyId, agentId],
        );

        const translations = await this.findTranslations(rows.map((row) => row.check_id));

        return rows.map((row) => {
            const es = translations.get(row.check_id);
            return {
                checkId: row.check_id,
                title: es?.title_es ?? row.title,
                result: row.agent_result,
                description: es?.description_es ?? row.description,
                rationale: es?.rationale_es ?? row.rationale,
                remediation: es?.remediation_es ?? row.remediation,
                soc2Code: row.soc2_code,
                cisCode: row.cis_code,
                pciDssCode: row.pci_dss_code,
                soc2CodeInferred: row.soc2_code_inferred,
                soc2MappingSource: row.soc2_mapping_source,
                soc2MappingConfidence: row.soc2_mapping_confidence,
                soc2MappingCitation: row.soc2_mapping_citation,
            };
        });
    }

    async findDetailsByCheckIds(checkIds: string[]): Promise<Map<string, CisCheckDetail>> {
        const map = new Map<string, CisCheckDetail>();
        if (!checkIds.length) return map;

        const { rows } = await this.pool.query<CisCheckRow>(
            `SELECT ${CHECK_COLUMNS} FROM cis_checks WHERE check_id = ANY($1::text[])`,
            [checkIds],
        );

        const translations = await this.findTranslations(rows.map((row) => row.check_id));

        for (const row of rows) {
            map.set(row.check_id, toChecklistItem(row, translations.get(row.check_id)));
        }
        return map;
    }

    async findAgentInfo(agentId: string): Promise<WazuhAgentInfo | null> {
        const map = await this.findAgentInfoByIds([agentId]);
        return map.get(agentId) ?? null;
    }

    async findAgentInfoByIds(agentIds: string[]): Promise<Map<string, WazuhAgentInfo>> {
        const map = new Map<string, WazuhAgentInfo>();
        if (!agentIds.length) return map;

        const { rows } = await this.pool.query<{
            agent_id: string;
            name: string | null;
            status: string | null;
            os_platform: string | null;
            os_name: string | null;
            os_version: string | null;
        }>(
            `SELECT agent_id, name, status, os_platform, os_name, os_version
             FROM wazuh_agents WHERE agent_id = ANY($1::text[])`,
            [agentIds],
        );

        for (const row of rows) {
            map.set(row.agent_id, {
                agentId: row.agent_id,
                name: row.name,
                status: row.status,
                osPlatform: row.os_platform,
                osName: row.os_name,
                osVersion: row.os_version,
            });
        }
        return map;
    }

    onModuleDestroy() {
        return this.pool.end();
    }
}
