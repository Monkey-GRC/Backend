// Plan de clonado del catálogo al escenario de un servicio (MD-80). Lógica pura, sin Prisma ni Nest:
// recibe una foto del catálogo y de lo que el servicio ya tiene, y devuelve qué filas insertar.
//
// Reglas (modelo-datos.md §3.5, §7.1 a §7.3; decisiones D3, D28, D36, D37):
//  - Solo se clonan los controles APLICABLES: los que llegan por los puntos de enfoque de los requisitos
//    del marco cuyo criterio de confianza contrató el servicio.
//  - Es idempotente y respeta la personalización: lo que el servicio ya tiene (clonado antes, editado, dado
//    de baja o propio) no se vuelve a crear, y los hijos solo se crean para lo que es nuevo.
//  - Los requisitos, los puntos de enfoque y los tests NO se clonan (se referencian); sí el vínculo con los
//    tests, las dimensiones, las evidencias requeridas, los riesgos y las causas.
import { randomUUID } from 'node:crypto';

export type Dimension = 'policy' | 'server' | 'database' | 'app' | 'cloud';
export type ControlDimensionType = 'manual' | 'automated' | 'hybrid' | 'technical_manual';

export interface CatalogSnapshot {
  // Requisitos del marco contratado, con el criterio de confianza al que pertenecen.
  requirements: { id: string; trustCriterionId: string }[];
  // Puntos de enfoque → controles, ya resueltos al requisito al que pertenece el punto.
  requirementControls: { requirementId: string; controlId: string }[];
  controls: { id: string; code: string; description: string }[];
  dimensions: {
    controlId: string;
    dimension: Dimension;
    type: ControlDimensionType;
    requiresProbe: boolean;
    requiresAi: boolean;
    requiresComplianceConfirmation: boolean;
    reasonNotApplicable: string | null;
  }[];
  controlTests: { controlId: string; testId: string }[];
  // `testId`: la prueba documental a la que sirve el documento en este control; ausente o nulo = compartido con todas las del control (D88).
  evidenceTemplates: { controlId: string; code: string; description: string; dimension: Dimension; sequence: number; testId?: string | null }[];
  risks: { id: string; code: string; name: string; description: string; trustCriterion: string; potentialImpact: unknown; isActive: boolean }[];
  causes: { id: string; code: string; name: string; failureCategory: string; description: string }[];
  riskCauses: { riskId: string; causeId: string }[];
  causeControls: { causeId: string; controlId: string }[];
}

export interface CloneInput {
  tenantId: string;
  serviceId: string;
  // Periodo de evaluación del marco: es lo que dura la validez de una evidencia (decisión C1).
  evaluationPeriod: string;
  contractedTrustCriterionIds: string[];
  catalog: CatalogSnapshot;
  // Lo que el servicio ya tiene, por id de la plantilla de origen → id de la fila del cliente.
  existing: {
    controls: Map<string, string>;
    risks: Map<string, string>;
    causes: Map<string, string>;
    // Pares ya existentes, para no repetir aristas.
    riskCauseKeys: Set<string>; // `${clientRiskId}#${clientCauseId}`
    causeControlKeys: Set<string>; // `${clientCauseId}#${clientControlId}`
  };
}

export interface ClonePlan {
  clientControls: {
    id: string; tenantId: string; serviceId: string; controlId: string; ownCode: string;
    clientInterpretation: string; type: ControlDimensionType; sourceRef: string; isActive: boolean;
  }[];
  clientControlDimensions: {
    tenantId: string; clientControlId: string; dimension: Dimension; type: ControlDimensionType;
    requiresProbe: boolean; requiresAi: boolean; requiresComplianceConfirmation: boolean; reasonNotApplicable: string | null;
  }[];
  clientControlTests: { tenantId: string; clientControlId: string; testId: string }[];
  evidenceRequirements: {
    tenantId: string; clientControlId: string; responsibleId: null; code: string; sequence: number;
    description: string; dimension: Dimension; testId: string | null; validityWithinPeriod: string; sourceRef: string;
  }[];
  clientRisks: {
    id: string; tenantId: string; serviceId: string; riskId: string; code: string; name: string; description: string;
    trustCriterion: string; potentialImpact: unknown; isActive: boolean;
  }[];
  clientCauses: {
    id: string; tenantId: string; serviceId: string; causeId: string; code: string; name: string;
    failureCategory: string; description: string;
  }[];
  clientRiskCauses: { tenantId: string; clientRiskId: string; clientCauseId: string }[];
  clientCauseControls: { tenantId: string; clientCauseId: string; clientControlId: string }[];
}

export class NoTrustCriteriaError extends Error {
  constructor(serviceId: string) {
    super(`El servicio ${serviceId} no tiene ningún criterio de confianza contratado: no hay qué clonar.`);
  }
}

/** Tipo de un control del cliente a partir de sus dimensiones: el común, o `hybrid` si no coinciden. */
export function controlTypeOf(types: ControlDimensionType[]): ControlDimensionType {
  const distinct = new Set(types);
  if (distinct.size === 1) return [...distinct][0];
  return distinct.size === 0 ? 'manual' : 'hybrid';
}

const group = <T>(items: T[], key: (t: T) => string): Map<string, T[]> => {
  const m = new Map<string, T[]>();
  for (const it of items) m.set(key(it), [...(m.get(key(it)) ?? []), it]);
  return m;
};

export function buildClonePlan(input: CloneInput): ClonePlan {
  const { tenantId, serviceId, catalog: c, existing } = input;
  if (input.contractedTrustCriterionIds.length === 0) throw new NoTrustCriteriaError(serviceId);

  const contracted = new Set(input.contractedTrustCriterionIds);
  const applicableRequirements = new Set(c.requirements.filter((r) => contracted.has(r.trustCriterionId)).map((r) => r.id));
  const applicableControlIds = new Set(c.requirementControls.filter((r) => applicableRequirements.has(r.requirementId)).map((r) => r.controlId));

  const controlById = new Map(c.controls.map((k) => [k.id, k]));
  const dimsByControl = group(c.dimensions, (d) => d.controlId);
  const testsByControl = group(c.controlTests, (t) => t.controlId);
  const templatesByControl = group(c.evidenceTemplates, (t) => t.controlId);

  const plan: ClonePlan = {
    clientControls: [], clientControlDimensions: [], clientControlTests: [], evidenceRequirements: [],
    clientRisks: [], clientCauses: [], clientRiskCauses: [], clientCauseControls: [],
  };

  // Controles: id del cliente = el que ya existe, o uno nuevo. Los hijos solo se crean para los nuevos.
  const clientControlId = new Map<string, string>();
  const newControls = new Set<string>();
  for (const controlId of [...applicableControlIds].sort((a, b) => (controlById.get(a)?.code ?? '').localeCompare(controlById.get(b)?.code ?? ''))) {
    const control = controlById.get(controlId);
    if (!control) continue;
    const have = existing.controls.get(controlId);
    if (have) {
      clientControlId.set(controlId, have);
      continue;
    }
    const id = randomUUID();
    clientControlId.set(controlId, id);
    newControls.add(controlId);
    const dims = dimsByControl.get(controlId) ?? [];
    plan.clientControls.push({
      id, tenantId, serviceId, controlId, ownCode: control.code, clientInterpretation: control.description,
      type: controlTypeOf(dims.map((d) => d.type)), sourceRef: `vanta:${control.code}`, isActive: true,
    });
    for (const d of dims) {
      plan.clientControlDimensions.push({
        tenantId, clientControlId: id, dimension: d.dimension, type: d.type, requiresProbe: d.requiresProbe,
        requiresAi: d.requiresAi, requiresComplianceConfirmation: d.requiresComplianceConfirmation, reasonNotApplicable: d.reasonNotApplicable,
      });
    }
    for (const t of testsByControl.get(controlId) ?? []) plan.clientControlTests.push({ tenantId, clientControlId: id, testId: t.testId });
    for (const t of (templatesByControl.get(controlId) ?? []).slice().sort((a, b) => a.sequence - b.sequence)) {
      plan.evidenceRequirements.push({
        tenantId, clientControlId: id, responsibleId: null, code: t.code, sequence: t.sequence, description: t.description,
        dimension: t.dimension, testId: t.testId ?? null, validityWithinPeriod: input.evaluationPeriod, sourceRef: t.code,
      });
    }
  }

  // Riesgos y causas: el set base completo, no solo lo aplicable (D28).
  const clientRiskId = new Map<string, string>();
  const newRisks = new Set<string>();
  for (const r of c.risks) {
    const have = existing.risks.get(r.id);
    if (have) {
      clientRiskId.set(r.id, have);
      continue;
    }
    const id = randomUUID();
    clientRiskId.set(r.id, id);
    newRisks.add(r.id);
    plan.clientRisks.push({ id, tenantId, serviceId, riskId: r.id, code: r.code, name: r.name, description: r.description, trustCriterion: r.trustCriterion, potentialImpact: r.potentialImpact, isActive: r.isActive });
  }
  const clientCauseId = new Map<string, string>();
  const newCauses = new Set<string>();
  for (const k of c.causes) {
    const have = existing.causes.get(k.id);
    if (have) {
      clientCauseId.set(k.id, have);
      continue;
    }
    const id = randomUUID();
    clientCauseId.set(k.id, id);
    newCauses.add(k.id);
    plan.clientCauses.push({ id, tenantId, serviceId, causeId: k.id, code: k.code, name: k.name, failureCategory: k.failureCategory, description: k.description });
  }

  // Aristas: solo entre cosas que el cliente tiene, y solo si alguna punta es nueva (si ambas ya existían,
  // faltarla es una decisión del cliente). Una arista causa → control a un control NO aplicable no se clona.
  for (const rc of c.riskCauses) {
    const r = clientRiskId.get(rc.riskId);
    const k = clientCauseId.get(rc.causeId);
    if (!r || !k || !(newRisks.has(rc.riskId) || newCauses.has(rc.causeId))) continue;
    if (existing.riskCauseKeys.has(`${r}#${k}`)) continue;
    plan.clientRiskCauses.push({ tenantId, clientRiskId: r, clientCauseId: k });
  }
  for (const cc of c.causeControls) {
    const k = clientCauseId.get(cc.causeId);
    const ctl = clientControlId.get(cc.controlId);
    if (!k || !ctl || !(newCauses.has(cc.causeId) || newControls.has(cc.controlId))) continue;
    if (existing.causeControlKeys.has(`${k}#${ctl}`)) continue;
    plan.clientCauseControls.push({ tenantId, clientCauseId: k, clientControlId: ctl });
  }
  return plan;
}

export const planSize = (p: ClonePlan): Record<keyof ClonePlan, number> =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, (v as unknown[]).length])) as Record<keyof ClonePlan, number>;
