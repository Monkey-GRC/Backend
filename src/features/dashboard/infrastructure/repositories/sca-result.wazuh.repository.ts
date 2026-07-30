import { Injectable } from '@nestjs/common';
import { ChecklistOs } from 'generated/prisma-tenant/browser';
import {
  ScaCheckResult,
  ScaResultRepository,
} from '../../domain/repositories/sca-result.repository';
import { WazuhApiClient } from '../wazuh/wazuh-api.client';

const POLICY_ID_BY_OS: Record<ChecklistOs, string> = {
  [ChecklistOs.UBUNTU]: 'cis_ubuntu22-04',
  [ChecklistOs.WINDOWS]: 'cis_win11_enterprise',
};

@Injectable()
export class ScaResultWazuhRepository extends ScaResultRepository {
  constructor(private readonly wazuh: WazuhApiClient) {
    super();
  }

  async findAggregatedResultsByOs(
    os: ChecklistOs,
  ): Promise<Map<string, ScaCheckResult>> {
    const policyId = POLICY_ID_BY_OS[os];
    const agents = await this.wazuh.listAgents();
    const results = new Map<string, ScaCheckResult>();

    for (const agent of agents) {
      const policies = await this.wazuh.listPolicies(agent.id);
      if (!policies.some((policy) => policy.policy_id === policyId)) {
        continue;
      }

      const checks = await this.wazuh.listChecks(agent.id, policyId);
      for (const check of checks) {
        const checkId = String(check.id);
        const result = this.normalizeResult(check.result);
        const previous = results.get(checkId);

        // bool_and across agents: any failure marks the check as failed.
        if (result === 'failed' || previous === 'failed') {
          results.set(checkId, 'failed');
        } else if (result === 'passed' || previous === 'passed') {
          results.set(checkId, 'passed');
        } else {
          results.set(checkId, 'not_applicable');
        }
      }
    }

    return results;
  }

  // An empty result means "not applicable" in older Wazuh catalogs.
  private normalizeResult(result?: string): ScaCheckResult {
    if (result === 'passed' || result === 'failed') {
      return result;
    }
    return 'not_applicable';
  }
}
