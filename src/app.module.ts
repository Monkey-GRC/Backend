import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { GrcFrameworkModule } from './modules/grc-framework/grc-framework.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    GrcFrameworkModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
