import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';
import { SessionPolicy } from './domain/entities/session.entity';
import { AccessTokenService } from './domain/ports/access-token.service';
import { PasswordHasher } from './domain/ports/password-hasher';
import { AccessKeyRedemptionRepository } from './domain/repositories/access-key-redemption.repository';
import { ActivationRepository } from './domain/repositories/activation.repository';
import { OnboardingProgressReader } from './domain/ports/onboarding-progress.reader';
import { AuthUserRepository } from './domain/repositories/auth-user.repository';
import { MfaRepository } from './domain/repositories/mfa.repository';
import { PasswordRepository } from './domain/repositories/password.repository';
import { SessionRepository } from './domain/repositories/session.repository';
import { TrustedDeviceRepository } from './domain/repositories/trusted-device.repository';
import { GeoIpLookup } from './domain/ports/geo-ip.lookup';
import { AccessKeyAttemptLimiter } from './application/services/access-key-attempt-limiter.service';
import { MfaAttempts } from './application/services/mfa-attempts.service';
import { MfaChallengeService } from './application/services/mfa-challenge.service';
import { PasswordNotifier } from './application/services/password-notifier.service';
import { PasswordRules } from './application/services/password-rules.service';
import { MfaPolicy } from './application/services/mfa-policy.service';
import { TrustedDevices } from './application/services/trusted-devices.service';
import { ListDevicesUseCase } from './application/use-cases/devices/list-devices.use-case';
import { RevokeAllDevicesUseCase } from './application/use-cases/devices/revoke-all-devices.use-case';
import { RevokeDeviceUseCase } from './application/use-cases/devices/revoke-device.use-case';
import { SessionIssuer } from './application/services/session-issuer.service';
import { StepUp } from './application/services/step-up.service';
import { SESSION_POLICY } from './application/session-policy.token';
import { ActivateAccountUseCase } from './application/use-cases/activation/activate-account.use-case';
import { ChangePasswordUseCase } from './application/use-cases/password/change-password.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/password/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/password/reset-password.use-case';
import { ConfirmMfaSetupUseCase } from './application/use-cases/mfa/confirm-mfa-setup.use-case';
import { LookupActivationCodeUseCase } from './application/use-cases/activation/lookup-activation-code.use-case';
import { RedeemAccessKeyUseCase } from './application/use-cases/access-key/redeem-access-key.use-case';
import { SetLanguageUseCase } from './application/use-cases/session/set-language.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/session/get-current-user.use-case';
import { GetOnboardingProgressUseCase } from './application/use-cases/session/get-onboarding-progress.use-case';
import { LoginUseCase } from './application/use-cases/session/login.use-case';
import { LookupAccessKeyUseCase } from './application/use-cases/access-key/lookup-access-key.use-case';
import { LogoutUseCase } from './application/use-cases/session/logout.use-case';
import { RefreshSessionUseCase } from './application/use-cases/session/refresh-session.use-case';
import { RegenerateRecoveryCodesUseCase } from './application/use-cases/mfa/regenerate-recovery-codes.use-case';
import { ResetMfaUseCase } from './application/use-cases/mfa/reset-mfa.use-case';
import { StartMfaSetupUseCase } from './application/use-cases/mfa/start-mfa-setup.use-case';
import { ValidateSessionUseCase } from './application/use-cases/session/validate-session.use-case';
import { VerifyMfaUseCase } from './application/use-cases/mfa/verify-mfa.use-case';
import { AccessKeyRedemptionPrismaRepository } from './infrastructure/repositories/access-key-redemption.prisma.repository';
import { ActivationPrismaRepository } from './infrastructure/repositories/activation.prisma.repository';
import { AuthUserPrismaRepository } from './infrastructure/repositories/auth-user.prisma.repository';
import { MfaPrismaRepository } from './infrastructure/repositories/mfa.prisma.repository';
import { PasswordPrismaRepository } from './infrastructure/repositories/password.prisma.repository';
import { OnboardingProgressPrismaReader } from './infrastructure/repositories/onboarding-progress.prisma.reader';
import { TrustedDevicePrismaRepository } from './infrastructure/repositories/trusted-device.prisma.repository';
import { MaxmindGeoIpLookup } from './infrastructure/security/maxmind-geo-ip.lookup';
import { SessionPrismaRepository } from './infrastructure/repositories/session.prisma.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password.hasher';
import { JwtAccessTokenService } from './infrastructure/security/jwt-access-token.service';
import { AuthController } from './presentation/auth.controller';
import { DevicesController } from './presentation/devices.controller';
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
  controllers: [AuthController, DevicesController, MfaAdminController],
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
    { provide: TrustedDeviceRepository, useClass: TrustedDevicePrismaRepository },
    { provide: GeoIpLookup, useClass: MaxmindGeoIpLookup },
    { provide: MfaRepository, useClass: MfaPrismaRepository },
    { provide: PasswordRepository, useClass: PasswordPrismaRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: AccessTokenService, useClass: JwtAccessTokenService },
    { provide: AccessKeyRedemptionRepository, useClass: AccessKeyRedemptionPrismaRepository },
    { provide: ActivationRepository, useClass: ActivationPrismaRepository },
    { provide: OnboardingProgressReader, useClass: OnboardingProgressPrismaReader },
    GetOnboardingProgressUseCase,
    SessionIssuer,
    TrustedDevices,
    ListDevicesUseCase,
    RevokeDeviceUseCase,
    RevokeAllDevicesUseCase,
    AccessKeyAttemptLimiter,
    MfaPolicy,
    MfaChallengeService,
    MfaAttempts,
    StepUp,
    PasswordRules,
    PasswordNotifier,
    ChangePasswordUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
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
    SetLanguageUseCase,
    // El orden importa: primero se autentica (SessionAuthGuard), después se autoriza por rol y al final se limita el ritmo.
    { provide: APP_GUARD, useClass: SessionAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // SEG-19 · Al final: solo cuenta las peticiones que ya pasaron la sesión y el rol.
    { provide: APP_GUARD, useClass: RateLimitGuard },
  ],
})
export class AuthModule {}
