import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { OsVersionRule } from '../entities/technical-control.entities';
import { EnrollmentExecutionStatus } from '../agent-install/install-state';

// El agente de la sonda de un servidor y lo que hace falta para instalarlo (D113). Todo se lee y escribe dentro de la empresa (RLS): un activo de otra empresa no existe.
export type AgentInstallFacts = {
  assetId: string;
  // null: el activo existe pero no se conecta con un agente.
  agent: null | {
    agentId: string | null;
    hasKey: boolean;
    keyExpiresAt: Date | null;
    // El sistema (`linux`, `windows`…) y la versión que el cliente declaró.
    os: string;
    osVersion: Pick<OsVersionRule, 'code' | 'distribution' | 'distributionName' | 'versionLabel'>;
    // Cómo va la conexión del servidor con la sonda (D113): lo último que Monkey vio, y cuándo terminó de crear su agente (desde ahí corre el plazo de búsqueda).
    status: 'pending' | 'connected' | 'disconnected' | 'removed';
    lastSyncAt: Date | null;
    enrolledAt: Date | null;
  };
  latestEnrollment: { status: EnrollmentExecutionStatus; failureReason: string | null } | null;
};

export abstract class AgentInstallRepository {
  // null si el activo no existe para esta empresa (404).
  abstract getFacts(scope: TenantScope, assetId: string): Promise<AgentInstallFacts | null>;

  // Deja en cola la creación del agente. Con `reset` (generar de nuevo) borra antes el vínculo con el agente anterior y su clave: el trabajador retira el agente viejo de la
  // sonda por su nombre (que es el id del activo). Lanza EXECUTION_IN_PROGRESS si ya hay una ejecución abierta del activo.
  abstract queueEnrollment(scope: TenantScope, assetId: string, opts: { reset: boolean }, audit: AuditIntent<{ executionId: string }>): Promise<{ executionId: string }>;

  // Entrega la clave cifrada UNA sola vez y la borra, de forma atómica: dos peticiones a la vez no pueden llevársela las dos. null si no hay una clave vigente.
  abstract takeInstallKey(scope: TenantScope, assetId: string, audit: AuditIntent<{ assetId: string }>): Promise<string | null>;

  // Para armar el trabajo que recibe el trabajador al reclamar una ejecución de tipo `enrollment`.
  // `retired`: el activo ya se dio de baja, así que esta ejecución no crea un agente: lo retira de la sonda.
  abstract loadEnrollmentTarget(scope: TenantScope, executionId: string): Promise<{ assetId: string; platform: string; retired: boolean }>;

  // El trabajador creó el agente: cierra la ejecución, enlaza el agente con el activo y guarda la clave (cifrada, con su caducidad). Lanza EXECUTION_NOT_RUNNING si la ejecución
  // no está en curso. Si ese id de agente figuraba en otro activo (la sonda recicla ids), ese vínculo ya era una referencia colgada: se suelta (`released` lo cuenta en la auditoría).
  abstract completeEnrollment(
    scope: TenantScope,
    executionId: string,
    input: { agentId: string; keyCipher: string; keyExpiresAt: Date },
    audit: AuditIntent<{ executionId: string; assetId: string; agentId: string; released: number }>,
  ): Promise<{ assetId: string }>;

  // El trabajador retiró de la sonda el agente de un servidor dado de baja: cierra la ejecución. Lanza EXECUTION_NOT_RUNNING si no está en curso.
  abstract completeRemoval(scope: TenantScope, executionId: string, audit: AuditIntent<{ executionId: string; assetId: string }>): Promise<{ assetId: string }>;
}
