import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import path from 'path';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from './infrastructure/database/database.module';
import { OnboardingModule } from './features/onboarding/onboarding.module';

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
    OnboardingModule,
  ],
  controllers: [],
})
export class AppModule {}
