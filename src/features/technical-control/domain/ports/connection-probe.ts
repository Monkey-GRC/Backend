import { ConnectionCategory, ProbeMode } from '../../../../common/catalogs/technical-catalogs';

export type ProbeInput = {
  // A qué activo y empresa pertenece lo que se valida, y quién lo pidió (para el rastro). Las sondas que validan a través de un trabajador lo necesitan.
  assetId: string;
  companyId: string;
  actorUserId: string | null;
  category: ConnectionCategory;
  platform: string;
  ipAddress: string | null;
  // Descifradas, solo en memoria durante la llamada. Null en las conexiones por agente.
  credentials: Record<string, unknown> | null;
};

export type ProbeFieldError = { field: string; code: string };

export type ProbeResult =
  | { ok: true; technicalCoverage: string; checksAvailable: number }
  | { ok: false; fields: ProbeFieldError[] };

// Quien comprueba que Monkey puede evaluar un sistema del cliente (la "sonda"). Hoy no hay
// conectores productivos (D46): existen dos adaptadores y el que corre lo decide PROBE_MODE.
// Cuando haya uno real, se agrega un tercero sin tocar los casos de uso.
export abstract class ConnectionProbe {
  abstract readonly mode: ProbeMode;
  // Solo una sonda real puede afirmar que el activo está operando («Automatizado ≠ Operativo»).
  abstract readonly confirmsOperation: boolean;
  // Lanza CONNECTION_UNAVAILABLE si esta instalación aún no puede comprobar conexiones.
  abstract validate(input: ProbeInput): Promise<ProbeResult>;
}
