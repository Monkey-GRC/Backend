import { NO_COVERAGE } from '../../../../common/catalogs/technical-catalogs';
import { DomainError } from '../../../../common/errors/domain-error';
import { ConnectionProbe, ProbeFieldError, ProbeInput, ProbeResult } from '../../domain/ports/connection-probe';
import { ScanRepository } from '../../domain/repositories/scan.repository';

// Validación REAL de una conexión de nube (D58). El backend no toca la cuenta del cliente ni guarda llaves de AWS: encola una *validación* y el
// trabajador (el único componente con identidad en AWS) asume el rol y comprueba que la cuenta es la declarada. Aquí solo se espera el resultado
// unos segundos, de modo que la pantalla recibe una respuesta síncrona.
//
// Cada razón de fallo se traduce al campo que el cliente tiene que corregir; lo que es culpa nuestra (trabajador caído, llaves base vencidas)
// NO se le achaca al cliente: es «no disponible» (503) y la conexión queda como estaba.
const FIELD_BY_REASON: Record<string, string> = {
  'connection.role_not_found': 'role_arn',
  'connection.account_mismatch': 'role_arn',
  'connection.not_configured': 'role_arn',
  'connection.credentials_invalid': 'credentials',
  'connection.provider_not_supported': 'platform',
  'connection.regions_missing': 'regions',
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class RunnerConnectionProbe extends ConnectionProbe {
  readonly mode = 'runner' as const;
  // Esta sonda sí comprueba contra la cuenta real: «Automatizado = Operativo» es verdad aquí.
  readonly confirmsOperation = true;

  constructor(
    private readonly scans: ScanRepository,
    private readonly options: { waitMs: number; pollMs: number } = { waitMs: 25_000, pollMs: 400 },
  ) {
    super();
  }

  async validate(input: ProbeInput): Promise<ProbeResult> {
    // Solo la nube se comprueba así. Los agentes los verifica la sonda de servidores (otro adaptador, aún sin construir).
    if (input.category !== 'ac_01') throw new DomainError('CONNECTION_UNAVAILABLE');
    const scope = { companyId: input.companyId, userId: input.actorUserId ?? undefined };
    const { executionId } = await this.scans.queueValidation(scope, input.assetId, input.actorUserId, (q) => ({
      tenantId: input.companyId,
      userId: input.actorUserId,
      action: 'execution.queue',
      resource: 'execution',
      result: 'success',
      ipAddress: 'system',
      userAgent: 'system',
      beforeState: null,
      afterState: { execution_id: q.executionId, asset_id: input.assetId, kind: 'validation' },
    }));

    const deadline = Date.now() + this.options.waitMs;
    while (Date.now() < deadline) {
      const state = await this.scans.executionStatus(scope, executionId);
      if (!state || state.status === 'cancelled') throw new DomainError('CONNECTION_UNAVAILABLE');
      if (state.status === 'completed') {
        return { ok: true, technicalCoverage: NO_COVERAGE, checksAvailable: (await this.scans.catalogChecks('aws')).size };
      }
      if (state.status === 'failed') return this.failure(state.failureReason);
      await sleep(this.options.pollMs);
    }
    // Nadie la tomó a tiempo: se retira para no dejar el activo bloqueado (un activo no tiene dos ejecuciones abiertas) y se dice la verdad.
    await this.scans.cancelQueued(scope, executionId);
    throw new DomainError('CONNECTION_UNAVAILABLE');
  }

  private failure(reason: string | null): ProbeResult {
    const field = reason ? FIELD_BY_REASON[reason] : undefined;
    // Una razón que no es del cliente (el motor falló, venció el tiempo) es un problema nuestro, no de su conexión.
    if (!reason || !field) throw new DomainError('CONNECTION_UNAVAILABLE');
    const fields: ProbeFieldError[] = [{ field, code: reason }];
    return { ok: false, fields };
  }
}
