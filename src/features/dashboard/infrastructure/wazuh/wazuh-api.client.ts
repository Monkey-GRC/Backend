import {
  Injectable,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Agent, request } from 'undici';

type WazuhListResponse<T> = {
  data: {
    affected_items: T[];
    total_affected_items: number;
  };
};

export type WazuhAgent = {
  id: string;
  name: string;
  os?: { platform?: string };
};

export type WazuhScaPolicy = {
  policy_id: string;
};

export type WazuhScaCheck = {
  id: number;
  title: string;
  result?: string;
};

const PAGE_LIMIT = 500;

@Injectable()
export class WazuhApiClient implements OnModuleDestroy {
  private readonly logger = new Logger(WazuhApiClient.name);
  private readonly baseUrl = process.env.WAZUH_API_URL ?? '';
  private readonly dispatcher = new Agent({
    connect: { rejectUnauthorized: false },
  });
  private token: string | null = null;

  async listAgents(): Promise<WazuhAgent[]> {
    return this.getAllPages<WazuhAgent>(
      '/agents',
      'select=id,name,os.platform',
    );
  }

  async listPolicies(agentId: string): Promise<WazuhScaPolicy[]> {
    return this.getAllPages<WazuhScaPolicy>(`/sca/${agentId}`);
  }

  async listChecks(
    agentId: string,
    policyId: string,
  ): Promise<WazuhScaCheck[]> {
    return this.getAllPages<WazuhScaCheck>(
      `/sca/${agentId}/checks/${encodeURIComponent(policyId)}`,
      'select=id,title,result',
    );
  }

  private async getAllPages<T>(path: string, query = ''): Promise<T[]> {
    const items: T[] = [];
    let offset = 0;

    for (;;) {
      const separator = query ? '&' : '';
      const page = await this.get<WazuhListResponse<T>>(
        `${path}?${query}${separator}limit=${PAGE_LIMIT}&offset=${offset}`,
      );
      const batch = page.data.affected_items;
      items.push(...batch);
      if (batch.length < PAGE_LIMIT) {
        return items;
      }
      offset += PAGE_LIMIT;
    }
  }

  private async get<T>(path: string, retryOnUnauthorized = true): Promise<T> {
    const token = await this.getToken();
    const response = await request(`${this.baseUrl}${path}`, {
      dispatcher: this.dispatcher,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.statusCode === 401 && retryOnUnauthorized) {
      this.token = null;
      return this.get<T>(path, false);
    }

    if (response.statusCode >= 400) {
      const body = await response.body.text();
      this.logger.error(
        `Wazuh API ${response.statusCode} on GET ${path}: ${body}`,
      );
      throw new ServiceUnavailableException('Wazuh API request failed');
    }

    return (await response.body.json()) as T;
  }

  private async getToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    const username = process.env.WAZUH_API_USERNAME ?? '';
    const password = process.env.WAZUH_API_PASSWORD ?? '';
    const basic = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await request(
      `${this.baseUrl}/security/user/authenticate?raw=true`,
      {
        method: 'POST',
        dispatcher: this.dispatcher,
        headers: { Authorization: `Basic ${basic}` },
      },
    );

    if (response.statusCode >= 400) {
      const body = await response.body.text();
      this.logger.error(
        `Wazuh authentication failed (${response.statusCode}): ${body}`,
      );
      throw new ServiceUnavailableException('Wazuh API authentication failed');
    }

    this.token = (await response.body.text()).trim();
    return this.token;
  }

  onModuleDestroy() {
    return this.dispatcher.close();
  }
}
