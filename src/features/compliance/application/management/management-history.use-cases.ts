import { Injectable } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { Page } from '../../../../common/pagination/page';
import { canSeeControl } from '../../domain/controls/control-access';
import { seesLevelsOf } from '../../domain/management/allowed-actions';
import { HISTORY_TYPES, HistoryRow, HistoryType, ManagementHistoryRepository } from '../../domain/management/management-history.repository';
import type { OccurrenceRecord } from '../../domain/controls/management-extras';

// GET /v1/controls/{id}/management-history y GET …/requirements/{rid}/occurrences (contracts/cumplimiento/aprobacion.md, MD-529). Mismas reglas de lectura que `GET /v1/controls/{id}`.
/** Solo `YYYY-MM-DD`: un ISO con hora no es una fecha del contrato. */
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const toArray = ({ value }: { value: unknown }) => (value === undefined ? undefined : Array.isArray(value) ? value : [value]);

export class ManagementHistoryQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['at', '-at'], default: '-at', description: 'Orden por fecha del acto; `-at` la más reciente primero.' }) @IsOptional() @IsIn(['at', '-at']) sort: 'at' | '-at' = '-at';
  @ApiPropertyOptional({ enum: HISTORY_TYPES, enumName: 'ManagementHistoryType', isArray: true, description: 'Solo estos tipos de acto; repetible.' }) @IsOptional() @Transform(toArray) @IsArray() @IsIn(HISTORY_TYPES, { each: true }) type?: HistoryType[];
  @ApiPropertyOptional({ format: 'date', description: 'Desde esta fecha (incluida).' }) @IsOptional() @IsDateString({ strict: true }) @Matches(DAY) from?: string;
  @ApiPropertyOptional({ format: 'date', description: 'Hasta esta fecha (incluida).' }) @IsOptional() @IsDateString({ strict: true }) @Matches(DAY) to?: string;
}

export class OccurrencesQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ format: 'date', description: 'Solo el trimestre que empieza en esta fecha (el primer día del trimestre).' }) @IsOptional() @IsDateString({ strict: true }) @Matches(DAY) quarter_start?: string;
}

@Injectable()
export class ListManagementHistoryUseCase {
  constructor(private readonly repo: ManagementHistoryRepository) {}

  async execute(p: Principal, controlId: string, q: ManagementHistoryQuery): Promise<Page<HistoryRow>> {
    const scope = { companyId: p.companyId, userId: p.userId, role: p.role };
    const access = await this.repo.controlAccess(scope, controlId);
    if (!access) throw new DomainError('NOT_FOUND');
    if (!canSeeControl(p, access)) throw new DomainError('FORBIDDEN');
    if (q.from && q.to && q.from > q.to) throw new ValidationException([{ field: 'to', code: 'to.before_from' }]);
    const { items, total } = await this.repo.history(scope, controlId, {
      types: q.type ?? [], from: q.from ? new Date(`${q.from}T00:00:00.000Z`) : undefined, to: q.to ? new Date(`${q.to}T00:00:00.000Z`) : undefined, sort: q.sort, page: q.page, pageSize: q.page_size, includeLevels: seesLevelsOf(p, access),
    });
    return { items, total, page: q.page, pageSize: q.page_size };
  }
}

@Injectable()
export class ListOccurrencesUseCase {
  constructor(private readonly repo: ManagementHistoryRepository) {}

  async execute(p: Principal, controlId: string, requirementId: string, q: OccurrencesQuery): Promise<{ page: Page<OccurrenceRecord>; requirement: { id: string; code: string } }> {
    const scope = { companyId: p.companyId, userId: p.userId, role: p.role };
    const access = await this.repo.controlAccess(scope, controlId);
    if (!access) throw new DomainError('NOT_FOUND');
    if (!canSeeControl(p, access)) throw new DomainError('FORBIDDEN');
    const found = await this.repo.occurrences(scope, controlId, requirementId, { quarterStart: q.quarter_start ? new Date(`${q.quarter_start}T00:00:00.000Z`) : undefined, page: q.page, pageSize: q.page_size });
    if (!found) throw new DomainError('NOT_FOUND');
    return { page: { items: found.items, total: found.total, page: q.page, pageSize: q.page_size }, requirement: found.requirement };
  }
}
