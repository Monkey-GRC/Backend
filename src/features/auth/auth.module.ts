import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SessionPolicy } from './domain/entities/session.entity';
import { AccessTokenService } from './domain/ports/access-token.service';
import { PasswordHasher } from './domain/ports/password-hasher';
import { AccessKeyRedemptionRepository } from './domain/repositories/access-key-redemption.repository';
import { ActivationRepository } from './domain/repositories/activation.repository';
import { OnboardingProgressReader } from './domain/ports/onboarding-progress.reader';
import { AuthUserRepository } from './domain/repositories/auth-user.repository';
import { MfaRepository } from './domain/repositories/mfa.repository';
import { SessionRepository } from './domain/repositories/session.repository';
import { AccessKeyAttemptLimiter } from './application/services/access-key-attempt-limiter.service';
import { MfaAttempts } from './application/services/mfa-attempts.service';
import { MfaChallengeService } from './application/services/mfa-challenge.service';
import { MfaPolicy } from './application/services/mfa-policy.service';
import { SessionIssuer } from './application/services/session-issuer.service';
import { StepUp } from './application/services/step-up.service';
import { SESSION_POLICY } from './application/session-policy.token';
import { ActivateAccountUseCase } from './application/use-cases/activate-account.use-case';
import { ConfirmMfaSetupUseCase } from './application/use-cases/confirm-mfa-setup.use-case';
import { LookupActivationCodeUseCase } from './application/use-cases/lookup-activation-code.use-case';
import { RedeemAccessKeyUseCase } from './application/use-cases/redeem-access-key.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { GetOnboardingProgressUseCase } from './application/use-cases/get-onboarding-progress.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LookupAccessKeyUseCase } from './application/use-cases/lookup-access-key.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { RegenerateRecoveryCodesUseCase } from './application/use-cases/regenerate-recovery-codes.use-case';
import { ResetMfaUseCase } from './application/use-cases/reset-mfa.use-case';
import { StartMfaSetupUseCase } from './application/use-cases/start-mfa-setup.use-case';
import { ValidateSessionUseCase } from './application/use-cases/validate-session.use-case';
import { VerifyMfaUseCase } from './application/use-cases/verify-mfa.use-case';
import { AccessKeyRedemptionPrismaRepository } from './infrastructure/repositories/access-key-redemption.prisma.repository';
import { ActivationPrismaRepository } from './infrastructure/repositories/activation.prisma.repository';
import { AuthUserPrismaRepository } from './infrastructure/repositories/auth-user.prisma.repository';
import { MfaPrismaRepository } from './infrastructure/repositories/mfa.prisma.repository';
import { OnboardingProgressPrismaReader } from './infrastructure/repositories/onboarding-progress.prisma.reader';
import { SessionPrismaRepository } from './infrastructure/repositories/session.prisma.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password.hasher';
import { JwtAccessTokenService } from './infrastructure/security/jwt-access-token.service';
import { AuthController } from './presentation/auth.controller';
import { MfaAdminController } from './presentation/mfa-admin.controller';
import { SessionAuthGuard } from './presentation/guards/session-auth.guard';

const seconds = (config: ConfigService, key: string): number => {
  const value = Number(config.getOrThrow<string>(key));
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${key} debe ser un entero > 0`);
  return value;
};

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          algorithm: 'HS256',
          expiresIn: seconds(config, 'JWT_ACCESS_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController, MfaAdminController],
  // D97: Monkey Admin pide el código de la persona antes de archivar o reactivar una empresa.
  exports: [StepUp],
  providers: [
    {
      provide: SESSION_POLICY,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SessionPolicy => ({
        accessTokenTtl: seconds(config, 'JWT_ACCESS_EXPIRES_IN'),
        idleTimeout: seconds(config, 'SESSION_IDLE_TIMEOUT'),
        maxDuration: seconds(config, 'SESSION_MAX_DURATION'),
      }),
    },
    { provide: AuthUserRepository, useClass: AuthUserPrismaRepository },
    { provide: SessionRepository, useClass: SessionPrismaRepository },
    { provide: MfaRepository, useClass: MfaPrismaRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: AccessTokenService, useClass: JwtAccessTokenService },
    { provide: AccessKeyRedemptionRepository, useClass: AccessKeyRedemptionPrismaRepository },
    { provide: ActivationRepository, useClass: ActivationPrismaRepository },
    { provide: OnboardingProgressReader, useClass: OnboardingProgressPrismaReader },
    GetOnboardingProgressUseCase,
    SessionIssuer,
    AccessKeyAttemptLimiter,
    MfaPolicy,
    MfaChallengeService,
    MfaAttempts,
    StepUp,
    LoginUseCase,
    VerifyMfaUseCase,
    StartMfaSetupUseCase,
    ConfirmMfaSetupUseCase,
    RegenerateRecoveryCodesUseCase,
    ResetMfaUseCase,
    LookupAccessKeyUseCase,
    RedeemAccessKeyUseCase,
    LookupActivationCodeUseCase,
    ActivateAccountUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    ValidateSessionUseCase,
    GetCurrentUserUseCase,
    // El orden importa: primero se autentica (SessionAuthGuard), después se autoriza por rol.
    { provide: APP_GUARD, useClass: SessionAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
