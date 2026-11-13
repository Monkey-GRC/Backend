// Aislamiento entre empresas en la sonda de servidores (SEG-45, D112). Dominio puro.
//
// La sonda NO aísla a las empresas entre sí: un agente puede declarar el grupo que quiera (DT-33). Lo impone Monkey, con tres comprobaciones que se
// hacen SIEMPRE en el backend, aunque el trabajador ya haya hecho la suya: el trabajador es un proceso aparte y no se le cree a ciegas.
export type AgentLink = { tenantId: string; assetId: string; agentId: string };
export type ReportedAgent = { agentId: string; name: string; groups: readonly string[] };

export type IsolationVerdict = { ok: true } | { ok: false; code: 'AGENT_NOT_LINKED' | 'AGENT_GROUP_MISMATCH' };

// El grupo de cada empresa en la sonda es su `tenant_id` (UUID). Igual que en el trabajador (`runner/domain/sonda.ts`): el trabajador no importa
// nada de `src/features`, así que la regla vive en los dos sitios y cada uno tiene su prueba.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const agentGroupsMatchTenant = (groups: readonly string[], tenantId: string): boolean => groups.includes(tenantId) && groups.every((g) => g === tenantId || !UUID.test(g));

export function checkAgentIsolation(input: { link: AgentLink | null; reported: ReportedAgent; tenantId: string; assetId: string }): IsolationVerdict {
  const { link, reported, tenantId, assetId } = input;
  // 1. El agente tiene que estar enlazado a ESTE activo de ESTA empresa. El agente se identifica por su `agent_id` (la clave que Monkey pre-registró), no
  //    por el nombre ni por el grupo que él diga.
  if (!link || link.tenantId !== tenantId || link.assetId !== assetId || link.agentId !== reported.agentId) return { ok: false, code: 'AGENT_NOT_LINKED' };
  // 2. Su nombre en la sonda es el ID del activo (D112) y su grupo es el de la empresa, sin ser además el de otra.
  if (reported.name !== assetId || !agentGroupsMatchTenant(reported.groups, tenantId)) return { ok: false, code: 'AGENT_GROUP_MISMATCH' };
  return { ok: true };
}
