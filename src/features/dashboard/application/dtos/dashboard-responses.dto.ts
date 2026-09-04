import { ApiProperty } from '@nestjs/swagger';
import { ChecklistOs, ControlDimension, ControlType } from 'generated/prisma-tenant/browser';
import { ControlCompliance, DimensionCompliance } from '../compliance.calculator';
import type { ScaCheckResult } from '../compliance.calculator';
import { DashboardSummary } from '../use-cases/get-dashboard-summary.use-case';
import { ServerCompliance } from '../use-cases/get-dashboard-servers.use-case';
import {
  ControlCheckDetail,
  ControlChecksDetail,
  FailingAsset,
} from '../use-cases/get-control-checks-detail.use-case';

export class DimensionComplianceResponseDto implements DimensionCompliance {
  @ApiProperty({ enum: ControlDimension, example: 'SERVER' })
  dimension!: ControlDimension;

  @ApiProperty({ enum: ControlType, example: 'AUTOMATIC' })
  type!: ControlType;

  @ApiProperty({
    example: 90,
    description: '% de cumplimiento de ESTA dimensión (pass / (pass+fail) de sus checks/evidencia). 0 si la dimensión aplica pero no tiene ninguna evidencia resuelta.',
  })
  compliance!: number;

  @ApiProperty({ example: 45 })
  checksPassed!: number;

  @ApiProperty({ example: 5 })
  checksFailed!: number;

  @ApiProperty({ example: 0 })
  checksNotApplicable!: number;

  @ApiProperty({ example: 0 })
  checksPending!: number;
}

export class ControlComplianceResponseDto implements ControlCompliance {
  @ApiProperty({
    format: 'uuid',
    example: '4f9c2d1e-8a3b-4c5d-9e6f-7a8b9c0d1e2f',
  })
  id!: string;

  @ApiProperty({ example: 'CTR-4F9C2D', description: 'Unique control code' })
  code!: string;

  @ApiProperty({ example: 'Password policy' })
  name!: string;

  @ApiProperty({
    nullable: true,
    example: 'Enforces the corporate password policy on all endpoints',
  })
  description!: string | null;

  @ApiProperty({ enum: ControlType, example: 'HYBRID' })
  type!: ControlType;

  @ApiProperty({
    nullable: true,
    example: 45,
    description:
      'Promedio de las dimensiones aplicables (ver `dimensions`) — NO un promedio de checks individuales. Null solo si el control no tiene ninguna dimensión aplicable declarada todavía.',
  })
  compliance!: number | null;

  @ApiProperty({ type: [DimensionComplianceResponseDto], description: 'Desglose por cada dimensión aplicable (Política/Servidor/BD/Nube/App). Las no aplicables no aparecen.' })
  dimensions!: DimensionComplianceResponseDto[];

  @ApiProperty({ example: 4, description: 'Checks (automáticos, por cada servidor donde aplican, + manuales)' })
  checksTotal!: number;

  @ApiProperty({
    example: 2,
    description: 'Checks automáticos que pasan por servidor + checks manuales marcados como cumple',
  })
  checksPassed!: number;

  @ApiProperty({
    example: 2,
    description: 'Checks automáticos fallidos por servidor + checks manuales marcados como falla',
  })
  checksFailed!: number;

  @ApiProperty({
    example: 0,
    description: 'Checks no aplicables o sin resultado',
  })
  checksNotApplicable!: number;

  @ApiProperty({
    example: 1,
    description: 'Checks manuales que todavía nadie ha evaluado (no cuentan como cumple ni como falla)',
  })
  checksPending!: number;

  @ApiProperty({
    example: 2,
    description: 'Servidores registrados con al menos un check evaluado para este control',
  })
  serversEvaluated!: number;
}

export class FailingAssetResponseDto implements FailingAsset {
  @ApiProperty({ format: 'uuid' })
  assetId!: string;

  @ApiProperty({ example: 'db-prod-03.acmecorp.local' })
  name!: string;
}

export class ControlCheckDetailResponseDto implements ControlCheckDetail {
  @ApiProperty({ example: '26005', description: 'CIS check id in Wazuh' })
  checkId!: string;

  @ApiProperty({
    example: "Ensure 'Account lockout duration' is set to '15 or more minute(s)'.",
  })
  title!: string;

  @ApiProperty({ enum: ChecklistOs, example: 'WINDOWS' })
  os!: ChecklistOs;

  @ApiProperty({ enum: ControlDimension, example: 'SERVER' })
  dimension!: ControlDimension;

  @ApiProperty({
    enum: ['passed', 'failed', 'not_applicable'],
    example: 'failed',
    description:
      'Falla si falla en al menos uno de los servidores evaluados — ver `failingAssets` para saber exactamente cuáles.',
  })
  result!: ScaCheckResult;

  @ApiProperty({ nullable: true, description: 'Explicación de qué evalúa el check (catálogo CIS)' })
  description!: string | null;

  @ApiProperty({ nullable: true, description: 'Por qué importa este check (catálogo CIS)' })
  rationale!: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Solución exacta a aplicar cuando result es "failed" (catálogo CIS)',
  })
  remediation!: string | null;

  @ApiProperty({
    type: [FailingAssetResponseDto],
    description: 'Servidores específicos que incumplen este check. Vacío si result no es "failed".',
  })
  failingAssets!: FailingAssetResponseDto[];
}

export class ControlChecksDetailResponseDto implements ControlChecksDetail {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'CTR-120567' })
  code!: string;

  @ApiProperty({ example: 'Account lockout policy' })
  name!: string;

  @ApiProperty({ type: [ControlCheckDetailResponseDto] })
  checks!: ControlCheckDetailResponseDto[];
}

export class DashboardSummaryResponseDto implements DashboardSummary {
  @ApiProperty({
    nullable: true,
    example: 72.5,
    description:
      "Framework compliance % — simple average of every control's %, not weighted by check count. Null when no control has results.",
  })
  frameworkCompliance!: number | null;

  @ApiProperty({ example: 3, description: 'Controls at 100% compliance' })
  controlsCompliant!: number;

  @ApiProperty({
    example: 18,
    description: 'Controles con al menos un check evaluado — cobertura de la evaluación (no todos son AUTOMATIC)',
  })
  controlsEvaluated!: number;

  @ApiProperty({ example: 24, description: 'Todos los controles del framework: AUTOMATIC + MANUAL + HYBRID' })
  controlsTotal!: number;

  @ApiProperty({
    example: 12,
    description: 'Total failed checks across all controls (open findings)',
  })
  openFindings!: number;

  @ApiProperty({
    example: 2,
    description: 'Servidores registrados y activos (origen Wazuh) considerados en este resumen',
  })
  serversEvaluated!: number;

  @ApiProperty({ example: 'Acme Corp SAS' })
  companyName!: string;

  @ApiProperty({ example: 5, description: 'Total de Asset registrados (sin filtrar por estado)' })
  assetsCount!: number;

  @ApiProperty({
    description: 'Frameworks adoptados por este tenant, cada uno con su propio % de cumplimiento',
    type: 'array',
    items: {
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'SOC 2' },
        compliance: { type: 'number', nullable: true, example: 72.5 },
      },
    },
  })
  contractedTemplates!: { id: string; name: string; compliance: number | null }[];
}

export class ServerComplianceResponseDto implements ServerCompliance {
  @ApiProperty({ format: 'uuid' })
  assetId!: string;

  @ApiProperty({ example: 'AST-112648' })
  assetCode!: string;

  @ApiProperty({ example: 'Servidor de base de datos - Producción' })
  assetName!: string;

  @ApiProperty({ enum: ChecklistOs, example: 'UBUNTU' })
  os!: ChecklistOs;

  @ApiProperty({ nullable: true, example: 'Ubuntu' })
  osName!: string | null;

  @ApiProperty({ nullable: true, example: '22.04.5 LTS' })
  osVersion!: string | null;

  @ApiProperty({ example: 'active', description: 'Estado de conexión reportado por Wazuh' })
  status!: string;

  @ApiProperty({ nullable: true, example: 45.2 })
  compliance!: number | null;

  @ApiProperty({ example: 42 })
  checksTotal!: number;

  @ApiProperty({ example: 19 })
  checksPassed!: number;

  @ApiProperty({ example: 23 })
  checksFailed!: number;

  @ApiProperty({ example: 0 })
  checksNotApplicable!: number;
}
