import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { Public } from '../../../common/decorators/public.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RunnerFailDto, RunnerResultsDto } from '../application/dtos/runner.dtos';
import { ClaimExecutionUseCase, CompleteExecutionUseCase, FailExecutionUseCase } from '../application/use-cases/scan.use-cases';
import { RunnerTokenGuard } from './runner-token.guard';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

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
  ) {}

  @Post('claim')
  @HttpCode(HttpStatus.OK)
  async claim(@Res({ passthrough: true }) res: Response) {
    const job = await this.claimExecution.execute();
    if (!job) {
      res.status(HttpStatus.NO_CONTENT);
      return;
    }
    // Las llaves descifradas (canal de llaves) viajan SOLO aquí y no se registran nunca.
    const c = job.connection;
    return new ResponseDto(HttpStatus.OK, t('runner.claimed'), {
      execution_id: job.executionId,
      tenant_id: job.tenantId,
      asset_id: job.assetId,
      origin: job.origin,
      platform: job.platform,
      external_account_id: job.externalAccountId,
      regions: job.regions,
      connection: c.method === 'readonly_role' ? { method: c.method, role_arn: c.roleArn, external_id: c.externalId } : { method: c.method, access_key_id: c.accessKeyId, secret_access_key: c.secretAccessKey },
    });
  }

  @Post('executions/:id/results')
  @HttpCode(HttpStatus.OK)
  async results(@Param('id', idPipe) id: string, @Body() dto: RunnerResultsDto) {
    const out = await this.completeExecution.execute(dto.tenant_id, id, { engineVersion: dto.engine_version, regions: dto.regions, finishedAt: dto.finished_at, raw: dto.findings });
    return new ResponseDto(HttpStatus.OK, t('execution.completed'), { execution_id: out.executionId, status: 'completed', results: out.resultCount, resources: out.resourceCount });
  }

  @Post('executions/:id/fail')
  @HttpCode(HttpStatus.OK)
  async fail(@Param('id', idPipe) id: string, @Body() dto: RunnerFailDto) {
    const out = await this.failExecution.execute(dto.tenant_id, id, dto.reason);
    return new ResponseDto(HttpStatus.OK, t('execution.failed'), { execution_id: out.executionId, status: 'failed' });
  }
}
