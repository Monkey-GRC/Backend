import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';

// Los riesgos y las causas de UN servicio (tenant.client_risks, client_causes) y sus vínculos (modelo-datos.md §7.2). Cada empresa trabaja sobre su propia copia
// del catálogo (D28): editarla no cambia el catálogo ni a otra empresa. Toda escritura recibe su `audit`, que se escribe en la MISMA transacción (SEG-36).
// Un servicio tiene ~10 riesgos, ~56 causas y ~86 acciones: la lectura carga el grafo entero en bloque y los casos de uso lo filtran.

export type ControlLink = {
  controlId: string;
  ownCode: string;
  name: string;
  origin: 'catalog' | 'own';
  catalogCode: string | null;
  isMandatory: boolean;
  effect: 'probability' | 'impact' | null;
  assignedUserIds: string[];
};

export type RiskNode = {
  id: string;
  serviceId: string;
  code: string;
  name: string;
  description: string;
  trustCriterion: string;
  /** Texto guardado, tal cual (ver `lossTypesOf`). */
  potentialImpact: unknown;
  origin: 'catalog' | 'own';
  isActive: boolean;
  likelihood: number | null;
  impact: number | null;
  inherentRiskValue: number | null;
  inherentRiskLevel: string | null;
  causeIds: string[];
};

export type CauseNode = {
  id: string;
  serviceId: string;
  code: string;
  name: string;
  description: string;
  failureCategory: string;
  origin: 'catalog' | 'own';
  isActive: boolean;
  riskIds: string[];
  controls: ControlLink[];
};

export type RiskGraph = { serviceId: string; risks: RiskNode[]; causes: CauseNode[] };
export type GraphRef = { serviceId: string } | { riskId: string } | { causeId: string };

export type RiskRecord = { id: string; code: string; name: string; description: string; trustCriterion: string; potentialImpact: unknown; isActive: boolean };
export type CauseRecord = { id: string; code: string; name: string; description: string; failureCategory: string; isActive: boolean };
export type Changed<T> = { before: T; after: T };

export type RiskInput = { code?: string; name: string; description: string; trustCriterion: string; potentialImpact: string[] };
export type RiskPatch = Partial<Omit<RiskInput, 'code'>>;
export type CauseInput = { code?: string; name: string; description: string; failureCategory: string };
export type CausePatch = Partial<Omit<CauseInput, 'code'>>;

export abstract class RiskRepository {
  // null si el servicio, el riesgo o la causa no existen (o son de otra empresa).
  abstract loadGraph(scope: TenantScope, ref: GraphRef): Promise<RiskGraph | null>;

  // Lanzan CODE_ALREADY_EXISTS si el código ya está en el servicio. null si el servicio no existe.
  abstract createRisk(scope: TenantScope, serviceId: string, input: RiskInput, audit: AuditIntent<RiskRecord>): Promise<RiskRecord | null>;
  abstract createCause(scope: TenantScope, serviceId: string, input: CauseInput, audit: AuditIntent<CauseRecord>): Promise<CauseRecord | null>;

  // null si no existe. Lanzan RISK_INACTIVE / CAUSE_INACTIVE si está dado de baja.
  abstract updateRisk(scope: TenantScope, id: string, patch: RiskPatch, audit: AuditIntent<Changed<RiskRecord>>): Promise<Changed<RiskRecord> | null>;
  abstract updateCause(scope: TenantScope, id: string, patch: CausePatch, audit: AuditIntent<Changed<CauseRecord>>): Promise<Changed<CauseRecord> | null>;

  // Baja lógica: nunca se borra. null si no existe.
  abstract deactivateRisk(scope: TenantScope, id: string, audit: AuditIntent<Changed<RiskRecord>>): Promise<Changed<RiskRecord> | null>;
  abstract deactivateCause(scope: TenantScope, id: string, audit: AuditIntent<Changed<CauseRecord>>): Promise<Changed<CauseRecord> | null>;

  // Vínculos. Ambos lados deben ser del mismo servicio (y de la misma empresa): si no, NOT_FOUND. LINK_ALREADY_EXISTS si ya existe.
  abstract linkRiskCause(scope: TenantScope, riskId: string, causeId: string, audit: AuditIntent<{ riskId: string; causeId: string }>): Promise<void>;
  abstract unlinkRiskCause(scope: TenantScope, riskId: string, causeId: string, audit: AuditIntent<{ riskId: string; causeId: string }>): Promise<boolean>;
  abstract linkCauseControl(
    scope: TenantScope,
    causeId: string,
    controlId: string,
    options: { isMandatory: boolean; effect: 'probability' | 'impact' | null },
    audit: AuditIntent<{ causeId: string; controlId: string; isMandatory: boolean; effect: string | null }>,
  ): Promise<void>;
  abstract unlinkCauseControl(scope: TenantScope, causeId: string, controlId: string, audit: AuditIntent<{ causeId: string; controlId: string }>): Promise<boolean>;
}
