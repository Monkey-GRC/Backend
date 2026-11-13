import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { Public } from '../../../../common/decorators/public.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { RunnerClaimDto, RunnerEnrolledDto, RunnerFailDto, RunnerResultsDto, RunnerValidatedDto } from '../../application/dtos/runner.dtos';
import { CompleteAgentRemovalUseCase, CompleteEnrollmentUseCase } from '../../application/use-cases/agent-install.use-cases';
import { ClaimExecutionUseCase, CompleteExecutionUseCase, CompleteScaExecutionUseCase, CompleteValidationUseCase, FailExecutionUseCase } from '../../application/use-cases/scan.use-cases';
import type { Inventory } from '../../domain/entities/technical-control.entities';
import { RunnerTokenGuard } from './runner-token.guard';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// El cuerpo del trabajador → el inventario del dominio. Los atributos se limpian: solo valores simples y cortos (lo demás no es un dato del cliente, es ruido).
function toInventory(dto: RunnerValidatedDto['inventory']): Inventory | null {
  if (!dto) return null;
  return {
    warnings: dto.warnings ?? [],
    resources: dto.resources.map((r) => ({
      uid: r.uid,
      type: r.type,
      kind: r.kind,
      name: r.name ?? null,
      region: r.region ?? null,
      tags: r.tags ?? [],
      attributes: Object.fromEntries(
        Object.entries(r.attributes ?? {})
          .filter(([k, v]) => k.length <= 50 && (v === null || ['string', 'number', 'boolean'].includes(typeof v)))
          .slice(0, 30)
          .map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 200) : (v as string | number | boolean | null)]),
      ),
    })),
  };
}

// API interna del trabajador que ejecuta el motor de nube (D57, SEG-47). `@Public()` solo la saca de la sesión del cliente: la protege
// su propio guard (token de servicio, solo red interna). No sale en la documentación pública.
@ApiExcludeController()
@Public()
@UseGuards(RunnerTokenGuard)
@Controller('internal/runner')
export class RunnerController {
  constructor(
    private readonly claimExecution: ClaimExecutionUseCase,
    private readonly completeExecution: CompleteExecutionUseCase,
    private readonly failExecution: FailExecutionUseCase,
    private readonly completeValidation: CompleteValidationUseCase,
    private readonly completeEnrollment: CompleteEnrollmentUseCase,
    private readonly completeRemoval: CompleteAgentRemovalUseCase,
    private readonly completeSca: CompleteScaExecutionUseCase,
  ) {}

  @Post('claim')
  @HttpCode(HttpStatus.OK)
  async claim(@Body() dto: RunnerClaimDto, @Res({ passthrough: true }) res: Response) {
    const job = await this.claimExecution.execute(dto.kind);
    if (!job) {
      res.status(HttpStatus.NO_CONTENT);
      return;
    }
    // Las llaves descifradas (canal de llaves) viajan SOLO aquí y no se registran nunca.
    const c = job.connection;
    return new ResponseDto(HttpStatus.OK, t('runner.claimed'), {
      execution_id: job.executionId,
      kind: job.kind,
      tenant_id: job.tenantId,
      asset_id: job.assetId,
      origin: job.origin,
      platform: job.platform,
      external_account_id: job.externalAccountId,
      regions: job.regions,
      connection:
        c.method === 'agent'
          ? { method: c.method }
          : c.method === 'readonly_role'
            ? { method: c.method, role_arn: c.roleArn, external_id: c.externalId }
            : { method: c.method, access_key_id: c.accessKeyId, secret_access_key: c.secretAccessKey },
      // Solo al crear el agente de un servidor (D112): cómo se llama en la sonda y a qué grupo va.
      // Al evaluarlo, además, el agente que Monkey enlazó a este activo (`agent_id`).
      ...(job.agent ? { agent: { name: job.agent.name, group: job.agent.group, ...(job.agent.agentId ? { agent_id: job.agent.agentId } : {}), ...(job.agent.remove ? { remove: true } : {}) } } : {}),
    });
  }

  // El trabajador creó el agente de un servidor (D112). La clave se cifra y se guarda solo unos minutos: nunca se devuelve ni se registra.
  @Post('executions/:id/enrolled')
  @HttpCode(HttpStatus.OK)
  async enrolled(@Param('id', idPipe) id: string, @Body() dto: RunnerEnrolledDto) {
    const out = await this.completeEnrollment.execute(dto.tenant_id, id, { agentId: dto.agent_id, key: dto.key });
    return new ResponseDto(HttpStatus.OK, t('execution.completed'), { execution_id: out.executionId, status: 'completed' });
  }

  // El trabajador retiró de la sonda el agente de un servidor dado de baja (D112 punto 8).
  @Post('executions/:id/removed')
  @HttpCode(HttpStatus.OK)
  async removed(@Param('id', idPipe) id: string, @Body() dto: RunnerValidatedDto) {
    const out = await this.completeRemoval.execute(dto.tenant_id, id);
    return new ResponseDto(HttpStatus.OK, t('execution.completed'), { execution_id: out.executionId, status: 'completed' });
  }

  @Post('executions/:id/results')
  @HttpCode(HttpStatus.OK)
  async results(@Param('id', idPipe) id: string, @Body() dto: RunnerResultsDto) {
    // La lectura de la sonda de un servidor (D112): otra forma de cuerpo, otro cierre. La de nube sigue exactamente igual.
    if (dto.source === 'sca') {
      const sca = await this.completeSca.execute(dto.tenant_id, id, {
        sondaVersion: dto.sonda_version,
        finishedAt: dto.finished_at,
        agent: { agentId: dto.agent.agent_id, name: dto.agent.name, groups: dto.agent.groups },
        policies: dto.policies.map((p) => ({
          policyId: p.policy_id,
          name: p.name,
          scanEndedAt: p.scan_ended_at ?? null,
          checks: p.checks.map((c) => ({ id: c.id, result: c.result, reason: c.reason ?? null, compliance: c.compliance ?? [] })),
        })),
      });
      return new ResponseDto(HttpStatus.OK, t('execution.completed'), { execution_id: sca.executionId, status: 'completed', results: sca.resultCount });
    }
    const out = await this.completeExecution.execute(dto.tenant_id, id, { engineVersion: dto.engine_version, regions: dto.regions, finishedAt: dto.finished_at, raw: dto.findings });
    return new ResponseDto(HttpStatus.OK, t('execution.completed'), { execution_id: out.executionId, status: 'completed', results: out.resultCount, resources: out.resourceCount });
  }

  @Post('executions/:id/validated')
  @HttpCode(HttpStatus.OK)
  async validated(@Param('id', idPipe) id: string, @Body() dto: RunnerValidatedDto) {
    const out = await this.completeValidation.execute(dto.tenant_id, id, toInventory(dto.inventory));
    return new ResponseDto(HttpStatus.OK, t('execution.completed'), { execution_id: out.executionId, status: 'completed' });
  }

  @Post('executions/:id/fail')
  @HttpCode(HttpStatus.OK)
  async fail(@Param('id', idPipe) id: string, @Body() dto: RunnerFailDto) {
    const out = await this.failExecution.execute(dto.tenant_id, id, dto.reason);
    return new ResponseDto(HttpStatus.OK, t('execution.failed'), { execution_id: out.executionId, status: 'failed' });
  }
}
