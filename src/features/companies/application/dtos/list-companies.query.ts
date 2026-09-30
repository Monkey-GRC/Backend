import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import type { CompanySort } from '../../domain/repositories/company.repository';
import type { CompanyStatus } from '../../domain/entities/company.entity';

const SORTS: CompanySort[] = ['created_at', '-created_at', 'name', '-name'];
const STATUSES: CompanyStatus[] = ['active', 'suspended'];

// GET /v1/companies?page=1&page_size=25&sort=-created_at&status=active
export class ListCompaniesQuery {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 25, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size = 25;

  @ApiPropertyOptional({ enum: SORTS, default: '-created_at' })
  @IsOptional()
  @IsIn(SORTS)
  sort: CompanySort = '-created_at';

  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: CompanyStatus;
}
