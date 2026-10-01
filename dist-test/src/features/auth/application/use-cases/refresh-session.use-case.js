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
exports.RefreshSessionUseCase = void 0;
const common_1 = require("@nestjs/common");
const domain_error_1 = require("../../../../common/errors/domain-error");
const access_token_service_1 = require("../../domain/ports/access-token.service");
const token_hasher_1 = require("../../../../common/security/token-hasher");
const auth_user_repository_1 = require("../../domain/repositories/auth-user.repository");
const session_repository_1 = require("../../domain/repositories/session.repository");
const session_policy_token_1 = require("../session-policy.token");
let RefreshSessionUseCase = class RefreshSessionUseCase {
    users;
    sessions;
    tokens;
    accessTokens;
    policy;
    constructor(users, sessions, tokens, accessTokens, policy) {
        this.users = users;
        this.sessions = sessions;
        this.tokens = tokens;
        this.accessTokens = accessTokens;
        this.policy = policy;
    }
    async execute(refreshToken) {
        if (!refreshToken)
            throw new domain_error_1.DomainError('SESSION_EXPIRED');
        const now = new Date();
        const session = await this.sessions.findByRefreshTokenHash(this.tokens.hash(refreshToken));
        if (!session)
            throw new domain_error_1.DomainError('SESSION_EXPIRED');
        const scope = { companyId: session.companyId, userId: session.userId };
        const state = session.stateAt(now, this.policy);
        if (state !== 'active') {
            if (state !== 'revoked')
                await this.sessions.revoke(scope, session.id, now);
            throw new domain_error_1.DomainError('SESSION_EXPIRED');
        }
        const user = await this.users.findById(scope, session.userId);
        if (!user || !user.isActive()) {
            await this.sessions.revoke(scope, session.id, now);
            throw new domain_error_1.DomainError('ACCOUNT_INACTIVE');
        }
        const newRefreshToken = this.tokens.generate();
        await this.sessions.rotate(scope, session.id, this.tokens.hash(newRefreshToken), now);
        const accessToken = await this.accessTokens.sign({
            sub: user.id,
            cid: user.companyId,
            role: user.role,
            sid: session.id,
        });
        return { session, accessToken, refreshToken: newRefreshToken };
    }
};
exports.RefreshSessionUseCase = RefreshSessionUseCase;
exports.RefreshSessionUseCase = RefreshSessionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(session_policy_token_1.SESSION_POLICY)),
    __metadata("design:paramtypes", [auth_user_repository_1.AuthUserRepository,
        session_repository_1.SessionRepository,
        token_hasher_1.TokenHasher,
        access_token_service_1.AccessTokenService, Object])
], RefreshSessionUseCase);
//# sourceMappingURL=refresh-session.use-case.js.map