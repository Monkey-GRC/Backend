import { ApiProperty } from '@nestjs/swagger';
import { ChecklistOs, ControlType } from 'generated/prisma-tenant/browser';
import { ControlCompliance } from '../compliance.calculator';
import { DashboardSummary } from '../use-cases/get-dashboard-summary.use-case';
import {
  ControlCheckDetail,
  ControlChecksDetail,
} from '../use-cases/get-control-checks-detail.use-case';
import type { ScaCheckResult } from '../../domain/repositories/sca-result.repository';

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
    example: 50,
    description:
      'Percentage of passed checks over applicable checks (0-100). Null cuando el control no tiene ningún check evaluado todavía.',
  })
  compliance!: number | null;

  @ApiProperty({ example: 4, description: 'Checks (automáticos + manuales) del control' })
  checksTotal!: number;

  @ApiProperty({
    example: 2,
    description: 'Checks automáticos que pasan en todos los agentes + checks manuales marcados como cumple',
  })
  checksPassed!: number;

  @ApiProperty({
    example: 2,
    description: 'Checks automáticos fallidos en al menos un agente + checks manuales marcados como falla',
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

  @ApiProperty({
    enum: ['passed', 'failed', 'not_applicable'],
    example: 'failed',
    description:
      'Aggregated result across all agents (bool_and): passed only if it passed on every agent running the policy.',
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
}
