import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
  ApiServiceUnavailableResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { GetControlChecksDetailUseCase } from '../application/use-cases/get-control-checks-detail.use-case';
import { GetDashboardControlsUseCase } from '../application/use-cases/get-dashboard-controls.use-case';
import { GetDashboardSummaryUseCase } from '../application/use-cases/get-dashboard-summary.use-case';
import {
  ControlChecksDetailResponseDto,
  ControlComplianceResponseDto,
  DashboardSummaryResponseDto,
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
@ApiServiceUnavailableResponse({
  description: 'Wazuh Manager API unreachable or rejected the request',
})
@ApiExtraModels(
  ControlComplianceResponseDto,
  DashboardSummaryResponseDto,
  ControlChecksDetailResponseDto,
)
@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
    private readonly getDashboardControlsUseCase: GetDashboardControlsUseCase,
    private readonly getControlChecksDetailUseCase: GetControlChecksDetailUseCase,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Executive compliance summary (Level 1)',
    description:
      'Framework-wide compliance computed from live Wazuh SCA results. ' +
      'A check counts as passed only if it passes on every agent running its policy (bool_and). ' +
      "Framework % is the simple average of every control's %, not weighted by check count.",
  })
  @ApiOkResponse({
    description: 'Compliance summary',
    ...responseEnvelope({ $ref: getSchemaPath(DashboardSummaryResponseDto) }),
  })
  async getSummary() {
    const data = await this.getDashboardSummaryUseCase.execute();
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
      'One row per AUTOMATIC control with its compliance % and check counts ' +
      '(passed / failed / not applicable), aggregated across all agents. ' +
      "A control's % = passed checks / applicable checks; every check weighs equally.",
  })
  @ApiOkResponse({
    description: 'Per-control compliance list',
    ...responseEnvelope({
      type: 'array',
      items: { $ref: getSchemaPath(ControlComplianceResponseDto) },
    }),
  })
  async getControls() {
    const data = await this.getDashboardControlsUseCase.execute();
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Cumplimiento por control obtenido',
      data,
    });
  }

  @Get('controls/:id/checks')
  @ApiOperation({
    summary: 'Check-level detail for one control',
    description:
      'Every check attached to the control with its aggregated result ' +
      '(passed / failed / not_applicable) across all agents. ' +
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
