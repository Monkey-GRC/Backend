import { ApiProperty } from '@nestjs/swagger';
import { ChecklistOs } from 'generated/prisma/browser';
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

  @ApiProperty({
    nullable: true,
    example: 50,
    description:
      'Percentage of passed checks over applicable checks (0-100). Null when the control has no applicable results yet.',
  })
  compliance!: number | null;

  @ApiProperty({ example: 4, description: 'Checks attached to the control' })
  checksTotal!: number;

  @ApiProperty({
    example: 2,
    description: 'Checks passing on every agent (bool_and aggregation)',
  })
  checksPassed!: number;

  @ApiProperty({
    example: 2,
    description: 'Checks failing on at least one agent',
  })
  checksFailed!: number;

  @ApiProperty({
    example: 0,
    description: 'Checks not applicable or without results',
  })
  checksNotApplicable!: number;
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

  @ApiProperty({ example: 8, description: 'AUTOMATIC controls evaluated' })
  controlsTotal!: number;

  @ApiProperty({
    example: 12,
    description: 'Total failed checks across all controls (open findings)',
  })
  openFindings!: number;
}
