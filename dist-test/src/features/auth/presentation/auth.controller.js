"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_i18n_1 = require("nestjs-i18n");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../../common/decorators/public.decorator");
const response_dto_1 = require("../../../common/dtos/response.dto");
const login_dto_1 = require("../application/dtos/login.dto");
const redeem_access_key_dto_1 = require("../application/dtos/redeem-access-key.dto");
const session_policy_token_1 = require("../application/session-policy.token");
const get_current_user_use_case_1 = require("../application/use-cases/get-current-user.use-case");
const get_onboarding_progress_use_case_1 = require("../application/use-cases/get-onboarding-progress.use-case");
const login_use_case_1 = require("../application/use-cases/login.use-case");
const logout_use_case_1 = require("../application/use-cases/logout.use-case");
const redeem_access_key_use_case_1 = require("../application/use-cases/redeem-access-key.use-case");
const refresh_session_use_case_1 = require("../application/use-cases/refresh-session.use-case");
const auth_cookies_1 = require("./auth-cookies");
const auth_response_mapper_1 = require("./auth-response.mapper");
const t = (key) => nestjs_i18n_1.I18nContext.current()?.t(key) ?? key;
let AuthController = class AuthController {
    login;
    refresh;
    logout;
    getCurrentUser;
    redeemAccessKey;
    getOnboardingProgress;
    policy;
    constructor(login, refresh, logout, getCurrentUser, redeemAccessKey, getOnboardingProgress, policy) {
        this.login = login;
        this.refresh = refresh;
        this.logout = logout;
        this.getCurrentUser = getCurrentUser;
        this.redeemAccessKey = redeemAccessKey;
        this.getOnboardingProgress = getOnboardingProgress;
        this.policy = policy;
    }
    async signIn(dto, req, res) {
        const result = await this.login.execute(dto.email, dto.password, (0, auth_cookies_1.requestMeta)(req));
        (0, auth_cookies_1.setAuthCookies)(res, result, this.policy.accessTokenTtl, result.session.expiresAt);
        const onboarding = await this.getOnboardingProgress.execute(result.user);
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('auth.logged_in'), (0, auth_response_mapper_1.toAuthResponse)(result.user, onboarding));
    }
    async redeem(dto, req, res) {
        const result = await this.redeemAccessKey.execute({
            code: dto.code,
            email: dto.email,
            password: dto.password,
            name: dto.name,
            lastName: dto.last_name,
        }, (0, auth_cookies_1.requestMeta)(req));
        (0, auth_cookies_1.setAuthCookies)(res, result, this.policy.accessTokenTtl, result.session.expiresAt);
        const onboarding = await this.getOnboardingProgress.execute(result.user);
        return new response_dto_1.ResponseDto(common_1.HttpStatus.CREATED, t('auth.account_created'), (0, auth_response_mapper_1.toAuthResponse)(result.user, onboarding));
    }
    async renew(req, res) {
        try {
            const result = await this.refresh.execute((0, auth_cookies_1.readCookie)(req, auth_cookies_1.REFRESH_COOKIE));
            (0, auth_cookies_1.setAuthCookies)(res, result, this.policy.accessTokenTtl, result.session.expiresAt);
            return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('auth.refreshed'), null);
        }
        catch (error) {
            (0, auth_cookies_1.clearAuthCookies)(res);
            throw error;
        }
    }
    async signOut(req, res) {
        await this.logout.execute((0, auth_cookies_1.readCookie)(req, auth_cookies_1.REFRESH_COOKIE), (0, auth_cookies_1.requestMeta)(req));
        (0, auth_cookies_1.clearAuthCookies)(res);
    }
    async me(principal) {
        const user = await this.getCurrentUser.execute(principal);
        const onboarding = await this.getOnboardingProgress.execute(user);
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('auth.me'), (0, auth_response_mapper_1.toAuthResponse)(user, onboarding));
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('redeem'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [redeem_access_key_dto_1.RedeemAccessKeyDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "redeem", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "renew", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signOut", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __param(6, (0, common_1.Inject)(session_policy_token_1.SESSION_POLICY)),
    __metadata("design:paramtypes", [login_use_case_1.LoginUseCase,
        refresh_session_use_case_1.RefreshSessionUseCase,
        logout_use_case_1.LogoutUseCase,
        get_current_user_use_case_1.GetCurrentUserUseCase,
        redeem_access_key_use_case_1.RedeemAccessKeyUseCase,
        get_onboarding_progress_use_case_1.GetOnboardingProgressUseCase, Object])
], AuthController);
//# sourceMappingURL=auth.controller.js.map