// La sonda de servidores vista desde el trabajador (D113). Dominio puro: sin Nest, sin HTTP, sin Prisma.
//
// El trabajador NO interpreta nada: lee el estado de configuración (SCA) de UN agente y lo entrega al backend tal cual, con las etiquetas que traiga.
// Qué significa cada check, a qué prueba va y si cuenta lo decide el backend con el catálogo del comité.

export type SondaAgentStatus = 'active' | 'disconnected' | 'pending' | 'never_connected';

export type SondaAgent = {
  id: string;
  name: string;
  groups: string[];
  status: SondaAgentStatus;
  osName: string | null;
  osVersion: string | null;
  agentVersion: string | null;
  lastKeepAlive: string | null;
};

// El resultado de un check TAL COMO lo manda la sonda (`passed`, `failed`, `not applicable`, vacío…). No se normaliza aquí.
export type SondaScaCheck = {
  id: string;
  result: string;
  reason: string | null;
  compliance: { key: string; value: string }[];
};

export type SondaScaPolicySummary = { policyId: string; name: string; endScan: string | null };
export type SondaScaPolicy = SondaScaPolicySummary & { checks: SondaScaCheck[] };

// Lo que el trabajador entrega al backend para una ejecución.
export type SondaSnapshot = {
  sondaVersion: string;
  startedAt: Date;
  finishedAt: Date;
  agent: { id: string; name: string; groups: string[] };
  policies: SondaScaPolicy[];
};

// Cómo se lee la sonda. Solo LECTURA: este puerto no tiene ninguna operación que escriba (el alta de agentes es otro puerto, con otra credencial).
// Cada método lanza RunnerFailure si la sonda no responde o no autoriza (probe_unreachable / probe_unauthorized).
export abstract class SondaApi {
  // La versión de la API de la sonda (p. ej. `4.14.6`).
  abstract version(): Promise<string>;
  // null si el agente no existe.
  abstract agent(agentId: string): Promise<SondaAgent | null>;
  // Vacío si el agente aún no entregó ninguna evaluación.
  abstract scaPolicies(agentId: string): Promise<SondaScaPolicySummary[]>;
  abstract scaChecks(agentId: string, policyId: string): Promise<SondaScaCheck[]>;
}

// El grupo de cada empresa en la sonda es su `tenant_id` (UUID, D113). Un agente es de la empresa si está en SU grupo y en ningún otro con forma de
// empresa: pertenecer además al grupo de otra empresa es justo lo que hay que detectar (SEG-45). Un grupo que NO es un UUID (p. ej. uno de
// configuración por sistema operativo) no cuenta como otra empresa.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function agentGroupsMatchTenant(groups: readonly string[], tenantId: string): boolean {
  return groups.includes(tenantId) && groups.every((g) => g === tenantId || !UUID.test(g));
}

// Crear el agente de un servidor en la sonda (D113). Es un puerto APARTE del de lectura, a propósito: tiene otra credencial (`monkey_enroll`, con permisos para crear y
// retirar agentes de la sonda y nada más) y vive solo en el trabajador. Quien solo necesita leer nunca recibe esto.
// Cada método lanza RunnerFailure si la sonda no responde o no autoriza (probe_unreachable / probe_unauthorized).
export abstract class SondaEnrollApi {
  abstract version(): Promise<string>;
  // El grupo de la empresa en la sonda (su `tenant_id`): se crea si no existe. Crearlo dos veces no es un error.
  abstract ensureGroup(group: string): Promise<void>;
  // Retira el agente con ese nombre (el id del activo), si existe: un reintento, o «generar de nuevo». Devuelve si había uno.
  abstract removeAgentByName(name: string): Promise<boolean>;
  // Crea el agente, le asigna su grupo y devuelve su id y su clave (base64). Si algo falla a medias, no deja un agente suelto: lo retira antes de fallar.
  abstract createAgent(name: string, group: string): Promise<{ agentId: string; key: string }>;
}

// ¿La versión de la sonda es una de las que sabemos leer? `supported` son prefijos: `4.14` acepta 4.14.0, 4.14.6, 4.14.10… pero no 4.140 ni 4.15.
// Con una versión desconocida el trabajador NO adivina: se niega a leer (D113) y deja un aviso, en vez de guardar datos que no entiende.
export function isSupportedSondaVersion(version: string, supported: readonly string[]): boolean {
  const v = version.trim();
  if (!/^\d+(\.\d+){1,3}$/.test(v)) return false;
  return supported.some((s) => {
    const p = s.trim().replace(/\.+$/, '');
    return p.length > 0 && (v === p || v.startsWith(`${p}.`));
  });
}
