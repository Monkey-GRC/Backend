import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CompanyRepository } from './domain/repositories/company.repository';
import { ACCESS_KEY_TTL_HOURS } from './application/access-key-policy.token';
import { GetCompanyUseCase } from './application/use-cases/get-company.use-case';
import { ListCompaniesUseCase } from './application/use-cases/list-companies.use-case';
import { RegisterCompanyUseCase } from './application/use-cases/register-company.use-case';
import { CompanyPrismaRepository } from './infrastructure/repositories/company.prisma.repository';
import { CompaniesController } from './presentation/companies.controller';

@Module({
  controllers: [CompaniesController],
  providers: [
    {
      provide: ACCESS_KEY_TTL_HOURS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): number => {
        const hours = Number(config.getOrThrow<string>('ACCESS_KEY_TTL_HOURS'));
        if (!Number.isInteger(hours) || hours <= 0) {
          throw new Error('ACCESS_KEY_TTL_HOURS debe ser un entero > 0');
        }
        return hours;
      },
    },
    { provide: CompanyRepository, useClass: CompanyPrismaRepository },
    RegisterCompanyUseCase,
    ListCompaniesUseCase,
    GetCompanyUseCase,
  ],
})
export class CompaniesModule {}
