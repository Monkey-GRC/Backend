import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import path from 'path';
import { APP_FILTER } from '@nestjs/core';
import { CentralPrismaModule } from './infrastructure/database/central-prisma.module';
import { TenancyModule } from './infrastructure/tenancy/tenancy.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AuthModule } from './features/auth/auth.module';
import { RiskModule } from './features/risk/risk.module';
import { ReasonModule } from './features/reason/reason.module';
import { ControlModule } from './features/control/control.module';
import { ChecklistModule } from './features/checklist/checklist.module';
import { UserModule } from './features/user/user.module';
import { ClientModule } from './features/client/client.module';
import { ManualCheckModule } from './features/manual-check/manual-check.module';
import { TranslationModule } from './features/translation/translation.module';
import { AssetModule } from './features/asset/asset.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(process.cwd(), 'i18n'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    CentralPrismaModule,
    TenancyModule,
    AuthModule,
    RiskModule,
    ReasonModule,
    ControlModule,
    ChecklistModule,
    UserModule,
    ClientModule,
    ManualCheckModule,
    TranslationModule,
    AssetModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
