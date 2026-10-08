import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { EngineOutputParser } from '../../domain/ports/engine-output-parser';
import { EngineFinding, EngineStatus } from '../../domain/scan/scan.types';

// Lee la salida OCSF de un motor de configuración de nube y la normaliza. Falla en voz alta: una fila mal formada o un estado desconocido
// se informa con su posición; nunca se descarta en silencio (DT-50).

const STATUS: Record<string, EngineStatus> = { PASS: 'passed', FAIL: 'failed', MANUAL: 'manual', MUTED: 'muted' };

export class EngineOutputError extends Error {}

type Row = {
  status_code?: unknown;
  status?: unknown;
  severity?: unknown;
  status_detail?: unknown;
  metadata?: { event_code?: unknown };
  cloud?: { region?: unknown };
  resources?: { uid?: unknown; type?: unknown; name?: unknown }[];
};

export function parseOcsfFindings(json: unknown): EngineFinding[] {
  if (!Array.isArray(json)) throw new EngineOutputError('La salida del motor no es una lista de hallazgos.');
  return json.map((raw: Row, i) => {
    const checkId = raw?.metadata?.event_code;
    const resource = raw?.resources?.[0];
    if (typeof checkId !== 'string' || !checkId) throw new EngineOutputError(`Hallazgo ${i}: falta metadata.event_code.`);
    if (!resource || typeof resource.uid !== 'string' || !resource.uid) throw new EngineOutputError(`Hallazgo ${i} (${checkId}): falta el recurso.`);
    const code = typeof raw.status_code === 'string' ? raw.status_code : '';
    // En el formato OCSF un hallazgo silenciado en el motor se marca como «Suppressed».
    const status: EngineStatus = raw.status === 'Suppressed' ? 'muted' : (STATUS[code] ?? 'unknown');
    return {
      checkId,
      status,
      region: typeof raw.cloud?.region === 'string' ? raw.cloud.region : '',
      severity: typeof raw.severity === 'string' ? raw.severity.toLowerCase() : null,
      detail: typeof raw.status_detail === 'string' ? raw.status_detail : null,
      resource: { uid: resource.uid, type: typeof resource.type === 'string' ? resource.type : 'Other', name: typeof resource.name === 'string' ? resource.name : null },
    };
  });
}

@Injectable()
export class OcsfEngineOutputParser extends EngineOutputParser {
  parse(raw: unknown): EngineFinding[] {
    try {
      return parseOcsfFindings(raw);
    } catch (e) {
      if (e instanceof EngineOutputError) throw new DomainError('ENGINE_OUTPUT_INVALID', { reason: e.message });
      throw e;
    }
  }
}
