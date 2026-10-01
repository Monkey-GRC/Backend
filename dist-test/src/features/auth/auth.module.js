"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const roles_guard_1 = require("../../common/guards/roles.guard");
const access_token_service_1 = require("./domain/ports/access-token.service");
const password_hasher_1 = require("./domain/ports/password-hasher");
const access_key_redemption_repository_1 = require("./domain/repositories/access-key-redemption.repository");
const onboarding_progress_reader_1 = require("./domain/ports/onboarding-progress.reader");
const auth_user_repository_1 = require("./domain/repositories/auth-user.repository");
const session_repository_1 = require("./domain/repositories/session.repository");
const session_issuer_service_1 = require("./application/services/session-issuer.service");
const session_policy_token_1 = require("./application/session-policy.token");
const redeem_access_key_use_case_1 = require("./application/use-cases/redeem-access-key.use-case");
const get_current_user_use_case_1 = require("./application/use-cases/get-current-user.use-case");
const get_onboarding_progress_use_case_1 = require("./application/use-cases/get-onboarding-progress.use-case");
const login_use_case_1 = require("./application/use-cases/login.use-case");
const logout_use_case_1 = require("./application/use-cases/logout.use-case");
const refresh_session_use_case_1 = require("./application/use-cases/refresh-session.use-case");
const validate_session_use_case_1 = require("./application/use-cases/validate-session.use-case");
const access_key_redemption_prisma_repository_1 = require("./infrastructure/repositories/access-key-redemption.prisma.repository");
const auth_user_prisma_repository_1 = require("./infrastructure/repositories/auth-user.prisma.repository");
const onboarding_progress_prisma_reader_1 = require("./infrastructure/repositories/onboarding-progress.prisma.reader");
const session_prisma_repository_1 = require("./infrastructure/repositories/session.prisma.repository");
const bcrypt_password_hasher_1 = require("./infrastructure/security/bcrypt-password.hasher");
const jwt_access_token_service_1 = require("./infrastructure/security/jwt-access-token.service");
const auth_controller_1 = require("./presentation/auth.controller");
const session_auth_guard_1 = require("./presentation/guards/session-auth.guard");
const seconds = (config, key) => {
    const value = Number(config.getOrThrow(key));
    if (!Number.isInteger(value) || value <= 0)
        throw new Error(`${key} debe ser un entero > 0`);
    return value;
};
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.getOrThrow('JWT_SECRET'),
                    signOptions: {
                        algorithm: 'HS256',
                        expiresIn: seconds(config, 'JWT_ACCESS_EXPIRES_IN'),
                    },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            {
                provide: session_policy_token_1.SESSION_POLICY,
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    accessTokenTtl: seconds(config, 'JWT_ACCESS_EXPIRES_IN'),
                    idleTimeout: seconds(config, 'SESSION_IDLE_TIMEOUT'),
                    maxDuration: seconds(config, 'SESSION_MAX_DURATION'),
                }),
            },
            { provide: auth_user_repository_1.AuthUserRepository, useClass: auth_user_prisma_repository_1.AuthUserPrismaRepository },
            { provide: session_repository_1.SessionRepository, useClass: session_prisma_repository_1.SessionPrismaRepository },
            { provide: password_hasher_1.PasswordHasher, useClass: bcrypt_password_hasher_1.BcryptPasswordHasher },
            { provide: access_token_service_1.AccessTokenService, useClass: jwt_access_token_service_1.JwtAccessTokenService },
            { provide: access_key_redemption_repository_1.AccessKeyRedemptionRepository, useClass: access_key_redemption_prisma_repository_1.AccessKeyRedemptionPrismaRepository },
            { provide: onboarding_progress_reader_1.OnboardingProgressReader, useClass: onboarding_progress_prisma_reader_1.OnboardingProgressPrismaReader },
            get_onboarding_progress_use_case_1.GetOnboardingProgressUseCase,
            session_issuer_service_1.SessionIssuer,
            login_use_case_1.LoginUseCase,
            redeem_access_key_use_case_1.RedeemAccessKeyUseCase,
            refresh_session_use_case_1.RefreshSessionUseCase,
            logout_use_case_1.LogoutUseCase,
            validate_session_use_case_1.ValidateSessionUseCase,
            get_current_user_use_case_1.GetCurrentUserUseCase,
            { provide: core_1.APP_GUARD, useClass: session_auth_guard_1.SessionAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map