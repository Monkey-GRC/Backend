// Tipos de una corrida de un motor de configuración de nube, ya normalizados (D56). Dominio puro: sin Nest, sin Prisma.
// Los textos que traiga el motor son internos: nunca salen al cliente (P11, P14 D3).

export type EngineStatus = 'passed' | 'failed' | 'manual' | 'muted' | 'unknown';

// Una fila del motor: un check evaluado sobre un recurso, en una región.
export type EngineFinding = {
  checkId: string;
  status: EngineStatus;
  region: string;
  severity: string | null;
  detail: string | null;
  resource: { uid: string; type: string; name: string | null };
};

// Los cinco estados del check (modelo-datos.md §3.3).
export type CheckResultValue = 'passed' | 'failed' | 'invalid' | 'not_applicable' | 'not_run';

// Una evaluación: un check sobre un recurso. Las filas que solo difieren en la región se funden en una (D53).
export type InterpretedResult = {
  checkId: string;
  resourceKey: string | null; // null: el check se ejecutó y no devolvió filas (not_applicable)
  resourceUid: string | null;
  resourceType: string | null;
  resourceName: string | null;
  regions: string[];
  result: CheckResultValue;
  severity: string | null;
  detail: string | null;
};
