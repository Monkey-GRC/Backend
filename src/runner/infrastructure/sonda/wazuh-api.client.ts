import { FAILURE, RunnerFailure } from '../../domain/runner.types';
import { SondaAgent, SondaAgentStatus, SondaApi, SondaScaCheck, SondaScaPolicySummary } from '../../domain/sonda';
import { HttpTransport, WazuhApiOptions, WazuhSession } from './wazuh-session';

// Cliente de SOLO LECTURA de la API del manager de la sonda (D113). Documento interno: aquí sí se nombra al proveedor (rule 1 de CLAUDE.md).
//
// Qué hace y qué no:
//  - Autentica con el usuario de lectura (`monkey_sync`) por una sesión que SE NIEGA a enviar cualquier cosa que no sea un GET (y el POST de autenticación): no existe
//    ninguna llamada que cree, borre o cambie agentes, ni siquiera por error.
//  - Cada error se traduce a una RAZÓN estable (`connection.probe_unreachable`, `connection.probe_unauthorized`…). Nunca se vuelca el cuerpo de una respuesta ni la credencial.
export { nodeTransport } from './wazuh-session';
export type { HttpRequest, HttpResponse, HttpTransport, TlsOptions, WazuhApiOptions } from './wazuh-session';

const AGENT_ID = /^\d{3,8}$/;
const POLICY_ID = /^[A-Za-z0-9_.-]{1,120}$/;
const PAGE = 500;
const MAX_PAGES = 60;
const STATUSES: readonly SondaAgentStatus[] = ['active', 'disconnected', 'pending', 'never_connected'];

const str = (v: unknown, max = 300): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

export class WazuhApiClient extends SondaApi {
  private readonly session: WazuhSession;

  constructor(options: WazuhApiOptions, http: HttpTransport, now: () => number = Date.now) {
    super();
    this.session = new WazuhSession(options, http, now, true);
  }

  async version(): Promise<string> {
    const { status, json } = await this.session.request('GET', '/');
    if (status !== 200) throw new RunnerFailure(FAILURE.probeUnreachable, `versión: HTTP ${status}`);
    const v = str(json?.data?.api_version, 40);
    if (!v) throw new RunnerFailure(FAILURE.outputInvalid, 'la sonda no informó su versión');
    return v;
  }

  async agent(agentId: string): Promise<SondaAgent | null> {
    if (!AGENT_ID.test(agentId)) return null;
    const { status, json } = await this.session.request('GET', `/agents?agents_list=${agentId}&select=id,name,group,status,os.name,os.version,version,lastKeepAlive`);
    if (status !== 200) throw new RunnerFailure(FAILURE.probeUnreachable, `agente: HTTP ${status}`);
    const a = json?.data?.affected_items?.[0];
    if (!a) return null;
    const raw = str(a.status, 20) as SondaAgentStatus | null;
    return {
      id: String(a.id),
      name: str(a.name, 120) ?? '',
      groups: Array.isArray(a.group) ? a.group.filter((g: unknown): g is string => typeof g === 'string').slice(0, 20) : [],
      // Un estado que no conocemos NO se toma por «activo»: es lo más prudente.
      status: raw && STATUSES.includes(raw) ? raw : 'disconnected',
      osName: str(a.os?.name, 80),
      osVersion: str(a.os?.version, 80),
      agentVersion: str(a.version, 40),
      lastKeepAlive: str(a.lastKeepAlive, 40),
    };
  }

  async scaPolicies(agentId: string): Promise<SondaScaPolicySummary[]> {
    if (!AGENT_ID.test(agentId)) throw new RunnerFailure(FAILURE.agentNotFound);
    const { status, json } = await this.session.request('GET', `/sca/${agentId}`);
    // Un agente que nunca se conectó no tiene base en la sonda: la API responde 400 «There is no database for agent». No es un error nuestro.
    if (status === 400 && /no database for agent/i.test(String(json?.detail ?? ''))) return [];
    if (status !== 200) throw new RunnerFailure(FAILURE.probeUnreachable, `sca: HTTP ${status}`);
    const items: unknown[] = json?.data?.affected_items ?? [];
    return items.flatMap((p: any) => {
      const policyId = str(p?.policy_id, 120);
      return policyId && POLICY_ID.test(policyId) ? [{ policyId, name: str(p?.name, 200) ?? policyId, endScan: str(p?.end_scan, 40) }] : [];
    });
  }

  async scaChecks(agentId: string, policyId: string): Promise<SondaScaCheck[]> {
    if (!AGENT_ID.test(agentId)) throw new RunnerFailure(FAILURE.agentNotFound);
    if (!POLICY_ID.test(policyId)) throw new RunnerFailure(FAILURE.outputInvalid, 'política con identificador inválido');
    const out: SondaScaCheck[] = [];
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const { status, json } = await this.session.request('GET', `/sca/${agentId}/checks/${policyId}?limit=${PAGE}&offset=${page * PAGE}`);
      if (status !== 200) throw new RunnerFailure(FAILURE.probeUnreachable, `checks: HTTP ${status}`);
      const items: any[] = json?.data?.affected_items ?? [];
      for (const c of items) {
        const id = c?.id === undefined || c?.id === null ? null : String(c.id).slice(0, 40);
        if (!id) throw new RunnerFailure(FAILURE.outputInvalid, 'un check sin identificador');
        out.push({
          id,
          // El resultado se entrega TAL CUAL (`passed`, `failed`, `not applicable`, vacío…): normalizarlo es del backend.
          result: typeof c.result === 'string' ? c.result.trim().slice(0, 40) : '',
          reason: str(c.reason, 300),
          compliance: (Array.isArray(c.compliance) ? c.compliance : [])
            .flatMap((x: any) => (str(x?.key, 60) && str(x?.value, 300) ? [{ key: str(x.key, 60)!, value: str(x.value, 300)! }] : []))
            .slice(0, 60),
        });
      }
      const total = Number(json?.data?.total_affected_items ?? 0);
      if (items.length === 0 || out.length >= total) return out;
    }
    throw new RunnerFailure(FAILURE.outputInvalid, 'demasiadas páginas de checks');
  }
}
