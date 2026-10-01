import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import path from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuthModule } from './features/auth/auth.module';
import { CatalogsModule } from './features/catalogs/catalogs.module';
import { CompaniesModule } from './features/companies/companies.module';
import { OnboardingModule } from './features/onboarding/onboarding.module';
import { ServicesModule } from './features/services/services.module';
import { AuditModule } from './infrastructure/audit/audit.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { SecurityModule } from './infrastructure/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(process.cwd(), 'i18n'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    DatabaseModule,
    AuditModule,
    SecurityModule,
    AuthModule,
    CompaniesModule,
    CatalogsModule,
    OnboardingModule,
    ServicesModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
