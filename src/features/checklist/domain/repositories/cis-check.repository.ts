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
  soc2CodeInferred?: string | null;
  soc2MappingSource?: string | null;
  soc2MappingConfidence?: string | null;
  soc2MappingCitation?: string | null;
};

export type CisChecklistItem = CisCheckDetail;

export type WazuhAgentInfo = {
  agentId: string;
  name: string | null;
  status: string | null;
  osPlatform: string | null;
  osName: string | null;
  osVersion: string | null;
};

export abstract class CisCheckRepository {
  abstract findByOs(
    os: ChecklistOs,
    search?: string,
  ): Promise<CisChecklistItem[]>;
  abstract findByCheckIds(
    os: ChecklistOs,
    checkIds: string[],
  ): Promise<CisChecklistItem[]>;
  abstract findDetailsByCheckIds(
    checkIds: string[],
  ): Promise<Map<string, CisCheckDetail>>;
  abstract findComplianceForAgent(
    os: ChecklistOs,
    agentId: string,
  ): Promise<CisChecklistItem[]>;
  abstract findAgentInfo(agentId: string): Promise<WazuhAgentInfo | null>;
  abstract findAgentInfoByIds(
    agentIds: string[],
  ): Promise<Map<string, WazuhAgentInfo>>;
}
