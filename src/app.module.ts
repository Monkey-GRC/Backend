import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import path from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AdminUsersModule } from './features/admin-users/admin-users.module';
import { AuthModule } from './features/auth/auth.module';
import { CatalogAdminModule } from './features/catalog-admin/catalog-admin.module';
import { CatalogsModule } from './features/catalogs/catalogs.module';
import { CompaniesModule } from './features/companies/companies.module';
import { ComplianceModule } from './features/compliance/compliance.module';
import { DocumentsModule } from './features/documents/documents.module';
import { IntegrationsModule } from './features/integrations/integrations.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { OnboardingModule } from './features/onboarding/onboarding.module';
import { ServicesModule } from './features/services/services.module';
import { TeamModule } from './features/team/team.module';
import { TechnicalControlModule } from './features/technical-control/technical-control.module';
import { AuditModule } from './infrastructure/audit/audit.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { NotificationEmitterModule } from './infrastructure/notifications/notifications.module';
import { SecurityModule } from './infrastructure/security/security.module';
import { StorageModule } from './infrastructure/storage/storage.module';

@Module({
  imports: [
    // Bajo Jest (`JEST_WORKER_ID` solo existe ahí, y se fija antes de importar este módulo) no se lee el `.env` de desarrollo: las pruebas declaran lo que necesitan y así dan
    // lo mismo en local que en el CI, que no tiene `.env`. En desarrollo y producción la variable no existe y todo sigue igual.
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: process.env['JEST_WORKER_ID'] !== undefined }),
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
    MailModule,
    StorageModule,
    NotificationEmitterModule,
    AuthModule,
    CompaniesModule,
    CatalogsModule,
    CatalogAdminModule,
    OnboardingModule,
    ServicesModule,
    TeamModule,
    AdminUsersModule,
    ComplianceModule,
    TechnicalControlModule,
    IntegrationsModule,
    DocumentsModule,
    NotificationsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
