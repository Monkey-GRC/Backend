import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import path from 'path';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AuthModule } from './features/auth/auth.module';
import { RiskModule } from './features/risk/risk.module';
import { ReasonModule } from './features/reason/reason.module';
import { ControlModule } from './features/control/control.module';
import { ChecklistModule } from './features/checklist/checklist.module';
import { TemplateModule } from './features/template/template.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { UserModule } from './features/user/user.module';

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
    PrismaModule,
    AuthModule,
    RiskModule,
    ReasonModule,
    ControlModule,
    ChecklistModule,
    TemplateModule,
    DashboardModule,
    UserModule,
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
