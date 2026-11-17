import { FAILURE, RunnerFailure } from '../../domain/runner.types';
import { SondaEnrollApi } from '../../domain/sonda';
import { HttpTransport, WazuhApiOptions, WazuhSession } from './wazuh-session';

// Cliente de ALTA de agentes de la sonda (D113). Documento interno: aquí sí se nombra al proveedor (rule 1 de CLAUDE.md).
//
// Usa la credencial `monkey_enroll`, que solo puede crear y retirar agentes y grupos de la sonda (políticas propias de mínimos permisos: no reinicia ni actualiza agentes, no lee SCA, no
// toca usuarios de la API). Vive SOLO en el trabajador. Todo lo que se envía a una ruta de la API se valida antes con una forma estricta: un nombre de servidor raro no puede
// convertirse en otra llamada.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AGENT_ID = /^[0-9]{3,8}$/;
const KEY = /^[A-Za-z0-9+/]{40,600}={0,2}$/;

export class WazuhEnrollClient extends SondaEnrollApi {
  private readonly session: WazuhSession;

  constructor(options: WazuhApiOptions, http: HttpTransport, now: () => number = Date.now) {
    super();
    this.session = new WazuhSession(options, http, now, false);
  }

  async version(): Promise<string> {
    const { status, json } = await this.session.request('GET', '/');
    const v = typeof json?.data?.api_version === 'string' ? json.data.api_version.trim().slice(0, 40) : '';
    if (status !== 200 || !v) throw new RunnerFailure(FAILURE.probeUnreachable, `versión: HTTP ${status}`);
    return v;
  }

  async ensureGroup(group: string): Promise<void> {
    if (!UUID.test(group)) throw new RunnerFailure(FAILURE.agentEnrollFailed, 'grupo con forma inválida');
    const found = await this.session.request('GET', `/groups?groups_list=${group}`);
    if (found.status === 200 && Number(found.json?.data?.total_affected_items ?? 0) > 0) return;
    const made = await this.session.request('POST', '/groups', { group_id: group });
    // Otra corrida pudo crearlo entre la pregunta y la creación: no es un error mientras el grupo exista.
    if (made.status !== 200) {
      const again = await this.session.request('GET', `/groups?groups_list=${group}`);
      if (again.status !== 200 || Number(again.json?.data?.total_affected_items ?? 0) === 0) throw new RunnerFailure(FAILURE.agentEnrollFailed, `grupo: HTTP ${made.status}`);
    }
  }

  async removeAgentByName(name: string): Promise<boolean> {
    if (!UUID.test(name)) throw new RunnerFailure(FAILURE.agentEnrollFailed, 'nombre con forma inválida');
    const found = await this.session.request('GET', `/agents?q=name=${name}&select=id`);
    if (found.status !== 200) throw new RunnerFailure(FAILURE.agentEnrollFailed, `buscar agente: HTTP ${found.status}`);
    const ids: string[] = (found.json?.data?.affected_items ?? []).map((a: { id: unknown }) => String(a.id)).filter((id: string) => AGENT_ID.test(id));
    if (ids.length === 0) return false;
    await this.deleteAgents(ids);
    return true;
  }

  async createAgent(name: string, group: string): Promise<{ agentId: string; key: string }> {
    if (!UUID.test(name) || !UUID.test(group)) throw new RunnerFailure(FAILURE.agentEnrollFailed, 'nombre o grupo con forma inválida');
    const made = await this.session.request('POST', '/agents/insert', { name, ip: 'any' });
    const agentId = String(made.json?.data?.id ?? '');
    const key = String(made.json?.data?.key ?? '');
    if (made.status !== 200 || !AGENT_ID.test(agentId) || !KEY.test(key)) throw new RunnerFailure(FAILURE.agentEnrollFailed, `crear agente: HTTP ${made.status}`);
    try {
      const assigned = await this.session.request('PUT', `/agents/${agentId}/group/${group}`);
      if (assigned.status !== 200) throw new RunnerFailure(FAILURE.agentEnrollFailed, `asignar grupo: HTTP ${assigned.status}`);
    } catch (e) {
      // No deja un agente suelto, sin grupo y sin dueño: lo retira (si esto también falla, el siguiente intento lo retira por su nombre).
      await this.deleteAgents([agentId]).catch(() => undefined);
      throw e;
    }
    return { agentId, key };
  }

  private async deleteAgents(ids: string[]): Promise<void> {
    // `status=all` y `older_than=0s`: se retira aunque esté conectado o sea reciente (la API, sin ellos, solo borra agentes viejos y desconectados).
    const res = await this.session.request('DELETE', `/agents?agents_list=${ids.join(',')}&status=all&older_than=0s`);
    if (res.status !== 200) throw new RunnerFailure(FAILURE.agentEnrollFailed, `retirar agente: HTTP ${res.status}`);
  }
}
