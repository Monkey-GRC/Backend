import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { CompanyRepository } from './domain/repositories/company.repository';
import { AccessKeyDelivery } from './application/access-key-delivery.service';
import { ACCESS_KEY_TTL_HOURS } from './application/access-key-policy.token';
import { ArchiveCompanyUseCase } from './application/use-cases/archive-company.use-case';
import { GetCompanyUseCase } from './application/use-cases/get-company.use-case';
import { ListCompaniesUseCase } from './application/use-cases/list-companies.use-case';
import { ListPendingPurgeUseCase } from './application/use-cases/list-pending-purge.use-case';
import { PurgeExpiredCompaniesUseCase } from './application/use-cases/purge-expired-companies.use-case';
import { ReactivateCompanyUseCase } from './application/use-cases/reactivate-company.use-case';
import { RegenerateAccessKeyUseCase } from './application/use-cases/regenerate-access-key.use-case';
import { UpdateMaxUsersUseCase } from './application/use-cases/update-max-users.use-case';
import { RegisterCompanyUseCase } from './application/use-cases/register-company.use-case';
import { CompanyPurgeScheduler } from './infrastructure/company-purge.scheduler';
import { CompanyPrismaRepository } from './infrastructure/repositories/company.prisma.repository';
import { CompaniesController } from './presentation/companies.controller';

@Module({
  imports: [AuthModule],
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
    AccessKeyDelivery,
    RegisterCompanyUseCase,
    RegenerateAccessKeyUseCase,
    ListCompaniesUseCase,
    GetCompanyUseCase,
    ArchiveCompanyUseCase,
    ReactivateCompanyUseCase,
    ListPendingPurgeUseCase,
    UpdateMaxUsersUseCase,
    PurgeExpiredCompaniesUseCase,
    CompanyPurgeScheduler,
  ],
})
export class CompaniesModule {}
