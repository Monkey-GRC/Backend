import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { ClientCredentialsGuard } from 'src/common/guards/client-credentials.guard';
import { GetControlChecksDetailUseCase } from '../application/use-cases/get-control-checks-detail.use-case';
import { GetDashboardControlsUseCase } from '../application/use-cases/get-dashboard-controls.use-case';
import { GetDashboardServersUseCase } from '../application/use-cases/get-dashboard-servers.use-case';
import { GetDashboardSummaryUseCase } from '../application/use-cases/get-dashboard-summary.use-case';
import {
  ControlChecksDetailResponseDto,
  ControlComplianceResponseDto,
  DashboardSummaryResponseDto,
  ServerComplianceResponseDto,
} from '../application/dtos/dashboard-responses.dto';

const responseEnvelope = (dataSchema: object) => ({
  schema: {
    properties: {
      statusCode: { type: 'number', example: 200 },
      message: { type: 'string' },
      data: dataSchema,
    },
  },
});

@ApiTags('dashboard')
@ApiCookieAuth()
@ApiUnauthorizedResponse({
  description: 'Missing or expired access_token cookie',
})
@ApiExtraModels(
  ControlComplianceResponseDto,
  DashboardSummaryResponseDto,
  ControlChecksDetailResponseDto,
  ServerComplianceResponseDto,
)
@UseGuards(AuthGuard('jwt'), ClientCredentialsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
    private readonly getDashboardControlsUseCase: GetDashboardControlsUseCase,
    private readonly getDashboardServersUseCase: GetDashboardServersUseCase,
    private readonly getControlChecksDetailUseCase: GetControlChecksDetailUseCase,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Executive compliance summary (Level 1)',
    description:
      'Framework-wide compliance combinando todos los servidores registrados y activos. ' +
      "Framework % is the simple average of every control's %, not weighted by check count.",
  })
  @ApiOkResponse({
    description: 'Compliance summary',
    ...responseEnvelope({ $ref: getSchemaPath(DashboardSummaryResponseDto) }),
  })
  @ApiParam({ name: 'templateId', required: true, format: 'uuid', description: 'Template (framework) a resumir' })
  async getSummary(@Query('templateId', ParseUUIDPipe) templateId: string) {
    const data = await this.getDashboardSummaryUseCase.execute(templateId);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Resumen de cumplimiento obtenido',
      data,
    });
  }

  @Get('controls')
  @ApiOperation({
    summary: 'Per-control compliance breakdown (Level 2)',
    description:
      'One row per control con su % de cumplimiento y conteo de checks ' +
      '(passed / failed / not applicable), combinando todos los servidores registrados. ' +
      "A control's % = passed checks / applicable checks; every check weighs equally.",
  })
  @ApiOkResponse({
    description: 'Per-control compliance list',
    ...responseEnvelope({
      type: 'array',
      items: { $ref: getSchemaPath(ControlComplianceResponseDto) },
    }),
  })
  @ApiParam({ name: 'templateId', required: true, format: 'uuid', description: 'Template (framework) a evaluar' })
  async getControls(@Query('templateId', ParseUUIDPipe) templateId: string) {
    const data = await this.getDashboardControlsUseCase.execute(templateId);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Cumplimiento por control obtenido',
      data,
    });
  }

  @Get('servers')
  @ApiOperation({
    summary: 'Per-server compliance breakdown',
    description:
      'Una fila por servidor registrado (origen Wazuh) con su cumplimiento propio, ' +
      'limitado a los checks que ya forman parte de algún control del framework.',
  })
  @ApiOkResponse({
    description: 'Per-server compliance list',
    ...responseEnvelope({
      type: 'array',
      items: { $ref: getSchemaPath(ServerComplianceResponseDto) },
    }),
  })
  @ApiParam({ name: 'templateId', required: true, format: 'uuid', description: 'Template (framework) a evaluar' })
  async getServers(@Query('templateId', ParseUUIDPipe) templateId: string) {
    const data = await this.getDashboardServersUseCase.execute(templateId);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Cumplimiento por servidor obtenido',
      data,
    });
  }

  @Get('controls/:id/checks')
  @ApiOperation({
    summary: 'Check-level detail for one control',
    description:
      'Every check attached to the control with its aggregated result ' +
      '(passed / failed / not_applicable) entre los servidores registrados. ' +
      'Meant for the expandable detail row when a control is clicked in the dashboard.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Control id' })
  @ApiNotFoundResponse({ description: 'Control not found or not AUTOMATIC' })
  @ApiOkResponse({
    description: 'Control with per-check results',
    ...responseEnvelope({ $ref: getSchemaPath(ControlChecksDetailResponseDto) }),
  })
  async getControlChecks(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.getControlChecksDetailUseCase.execute(id);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Detalle de checks del control obtenido',
      data,
    });
  }
}
