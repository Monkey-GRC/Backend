// Tipos de una lectura de la sonda de servidores, ya validada (D112). Dominio puro: sin Nest, sin Prisma.
// Los textos que traiga la sonda son internos: nunca salen al cliente (D70).
import { CheckResultValue } from '../scan/scan.types';

// Lo que entrega el trabajador, tal como llega (el resultado SIN normalizar).
export type ScaCheckInput = {
  id: string;
  result: string;
  reason: string | null;
  compliance: { key: string; value: string }[];
};

export type ScaPolicyInput = {
  policyId: string;
  name: string;
  // Cuándo terminó la sonda de evaluar esta política en el servidor. Es la fecha de la medición (no la del momento de leerla).
  scanEndedAt: string | null;
  checks: ScaCheckInput[];
};

// Un check del catálogo del comité: la clave natural es de tres partes (`platform` + `policy_id` + `check_id`, D6).
export type CatalogCheckRef = { id: string; platform: string; policyId: string; rawCheckId: string };

// Cómo se busca un check en el catálogo. El nombre de la política viaja porque el catálogo del comité la nombra por su NOMBRE y la sonda por su id.
export type CatalogLookup = (policyId: string, policyName: string, rawCheckId: string) => CatalogCheckRef | null;

export type InterpretedScaRow = {
  checkId: string; // el id del catálogo (uuid)
  platform: string;
  policyId: string;
  rawCheckId: string;
  result: CheckResultValue;
  evaluatedAt: Date;
  // Por qué el check no pudo evaluarse (p. ej. «no se pudo abrir el archivo»): interno, para el auditor.
  statusDetail: string | null;
};

export type UnmappedPolicy = { policyId: string; policyName: string; checks: number };

export type InterpretedSca = {
  rows: InterpretedScaRow[];
  // Checks que la sonda devolvió y que el catálogo no conoce: se informan, no se descartan en silencio ni se inventan (D56, D112).
  unmapped: UnmappedPolicy[];
  // Un mismo check repetido en la entrega: se guarda una vez, el peor resultado.
  duplicates: number;
};
