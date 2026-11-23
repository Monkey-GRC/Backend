// Etiquetas en español del libro → valores de los enums (contracts/enums/catalogo-maestro.md; tabla 8 de 01_DESARROLLO).
import {
  CauseOrigin, CauseType, CheckRole, ControlType, Dimension, DocumentAcceptance, DocumentOrigin, DocumentType, ItemType, Periodicity, PrimarySource, RiskCriterion, RiskLevel,
  TestAutomation, TestLevel, TrustCriterion,
} from './types';

export const norm = (s: string): string => s.normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();

export type LabelMap<T extends string> = Readonly<Record<string, T>>;

const table = <T extends string>(pairs: [string, T][]): LabelMap<T> => Object.fromEntries(pairs.map(([k, v]) => [norm(k), v]));

export const DIMENSION = table<Dimension>([
  ['Documental', 'policy'], ['Aplicación', 'app'], ['Servidores', 'server'], ['BD', 'database'], ['Nube', 'cloud'], ['Red', 'network'], ['Endpoint', 'endpoint'],
  ['Físico y ambiental', 'physical'], ['Proceso', 'process'],
]);

// Columnas «TEST …» de Controles Monkey (la de físico y ambiental no lleva la palabra TEST). «Proceso» no tiene columna: solo existe en TEST.
export const DIMENSION_COLUMNS: Readonly<Record<string, Dimension>> = {
  'TEST DOCUMENTAL': 'policy', 'TEST APLICACIÓN': 'app', 'TEST SERVIDORES': 'server', 'TEST BD': 'database', 'TEST NUBE': 'cloud', 'TEST RED': 'network',
  'FÍSICO Y AMBIENTAL': 'physical', 'TEST ENDPOINT': 'endpoint',
};

export const CONTROL_TYPE = table<ControlType>([['Manual', 'manual'], ['Manual dependiente de TI', 'it_dependent_manual'], ['Automático', 'automated']]);

export const PERIODICITY = table<Periodicity>([
  ['Permanente', 'permanent'], ['Diario', 'daily'], ['Semanal', 'weekly'], ['Mensual', 'monthly'], ['Bimensual', 'bimonthly'], ['Trimestral', 'quarterly'],
  ['Semestral', 'semiannual'], ['Anual', 'annual'], ['Cuando sea Requerido', 'on_demand'],
]);

export const ITEM_TYPE = table<ItemType>([['Documental', 'documentary'], ['Población', 'population'], ['Operativo', 'operational'], ['Técnico', 'technical']]);

export const PRIMARY_SOURCE = table<PrimarySource>([
  ['Documento', 'document'], ['Manual', 'manual'], ['Wazuh', 'probe'], ['Prowler', 'cloud_engine'], ['Wazuh + Prowler', 'probe_and_cloud_engine'], ['Integración', 'integration'],
]);

export const TEST_LEVEL = table<TestLevel>([
  ['Diseño', 'design'], ['Implementación', 'implementation'], ['Eficacia', 'effectiveness'], ['Implementación y eficacia', 'implementation_and_effectiveness'],
]);

export const TEST_AUTOMATION = table<TestAutomation>([['Manual', 'manual'], ['Semiautomático', 'semi_automated'], ['Automático', 'automated']]);

export const CHECK_ROLE = table<CheckRole>([['Directo', 'direct'], ['Complementario', 'complementary'], ['Dependencia', 'dependency']]);

export const CAUSE_ORIGIN = table<CauseOrigin>([['INTERNO', 'internal'], ['EXTERNO', 'external']]);

export const CAUSE_TYPE = table<CauseType>([
  ['Humano (personas)', 'human'], ['Procesos y métodos', 'processes'], ['Información y datos', 'information'], ['Medición y monitoreo', 'measurement'],
  ['Tecnológico (sistemas)', 'technology'], ['Infraestructura física y activos', 'physical_infrastructure'], ['Delictivo y de seguridad', 'criminal_security'],
  ['Terceros y cadena de suministro', 'third_parties'], ['Legal y regulatorio', 'legal_regulatory'], ['Ambiental / natural', 'environmental'],
  ['Organizacional y gobierno', 'organizational_governance'], ['Financiero interno', 'internal_financial'], ['Estratégico', 'strategic'],
  ['Tecnológico externo', 'external_technology'], ['Climático (físico y de transición)', 'climate'], ['Biológico / salud pública', 'biological'],
  ['Político y geopolítico', 'political'], ['Económico y de mercado', 'economic'],
]);

export const DOCUMENT_TYPE = table<DocumentType>([['Política', 'policy'], ['Procedimiento', 'procedure'], ['Matriz', 'matrix'], ['Manual', 'manual'], ['Documento', 'document']]);
export const DOCUMENT_ORIGIN = table<DocumentOrigin>([['Interno', 'internal'], ['Externo', 'external']]);
export const DOCUMENT_ACCEPTANCE = table<DocumentAcceptance>([['Usuarios que lo aplican', 'users_who_apply'], ['Todos los usuarios', 'all_users'], ['No requiere', 'not_required']]);

export const RISK_LEVEL = table<RiskLevel>([['Bajo', 'low'], ['Moderado', 'moderate'], ['Alto', 'high'], ['Crítico', 'critical']]);

export const RISK_CRITERION = table<RiskCriterion>([
  ['Confidencialidad', 'confidentiality'], ['Integridad', 'integrity'], ['Disponibilidad', 'availability'], ['Privacidad', 'privacy'], ['Cumplimiento', 'compliance'],
  ['Continuidad', 'continuity'], ['Fraude', 'fraud'],
]);

// «Categoría (corto)» de Controles Monkey → criterio de confianza.
export const TRUST_CRITERION = table<TrustCriterion>([
  ['Criterios Comunes (Seguridad)', 'security'], ['Disponibilidad', 'availability'], ['Confidencialidad', 'confidentiality'], ['Integridad de Procesamiento', 'integrity'], ['Privacidad', 'privacy'],
]);

// El nombre de cada criterio de confianza tal como lo escribe el libro en «Categoría (corto)».
export const TRUST_CRITERION_NAMES: Readonly<Record<TrustCriterion, string>> = {
  security: 'Criterios Comunes (Seguridad)', availability: 'Disponibilidad', confidentiality: 'Confidencialidad', integrity: 'Integridad de Procesamiento', privacy: 'Privacidad',
};

export const PREFIX_TO_CRITERION: Readonly<Record<string, TrustCriterion>> = { A: 'availability', C: 'confidentiality', CC: 'security', P: 'privacy', PI: 'integrity' };

// Tipos de pérdida que el comentario de Riesgos!E1 permite. P9: R003 y R004 traen «Interrupción de la operación», que no está en la lista; se carga literal.
export const LOSS_TYPES: readonly string[] = [
  'Pérdida financiera', 'Reputacional', 'Sanción regulatoria', 'Litigios', 'Interrupción o cierre de la operación', 'Pérdida de confianza de clientes',
];
export const KNOWN_LOSS_TYPE_VARIANTS: readonly string[] = ['Interrupción de la operación'];

export function lookup<T extends string>(map: LabelMap<T>, raw: unknown): T | null {
  if (raw === null || raw === undefined) return null;
  return map[norm(String(raw))] ?? null;
}
