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
exports.ValidateSessionUseCase = void 0;
const common_1 = require("@nestjs/common");
const domain_error_1 = require("../../../../common/errors/domain-error");
const access_token_service_1 = require("../../domain/ports/access-token.service");
const auth_user_repository_1 = require("../../domain/repositories/auth-user.repository");
const session_repository_1 = require("../../domain/repositories/session.repository");
const session_policy_token_1 = require("../session-policy.token");
const TOUCH_THROTTLE_MS = 60_000;
let ValidateSessionUseCase = class ValidateSessionUseCase {
    users;
    sessions;
    accessTokens;
    policy;
    constructor(users, sessions, accessTokens, policy) {
        this.users = users;
        this.sessions = sessions;
        this.accessTokens = accessTokens;
        this.policy = policy;
    }
    async execute(accessToken) {
        if (!accessToken)
            throw new domain_error_1.DomainError('UNAUTHENTICATED');
        const claims = await this.accessTokens.verify(accessToken);
        if (!claims)
            throw new domain_error_1.DomainError('UNAUTHENTICATED');
        const now = new Date();
        const scope = { companyId: claims.cid, userId: claims.sub };
        const session = await this.sessions.findById(scope, claims.sid);
        if (!session || session.userId !== claims.sub)
            throw new domain_error_1.DomainError('UNAUTHENTICATED');
        const state = session.stateAt(now, this.policy);
        if (state !== 'active') {
            if (state !== 'revoked')
                await this.sessions.revoke(scope, session.id, now);
            throw new domain_error_1.DomainError('SESSION_EXPIRED');
        }
        const user = await this.users.findById(scope, claims.sub);
        if (!user || !user.isActive()) {
            await this.sessions.revoke(scope, session.id, now);
            throw new domain_error_1.DomainError('ACCOUNT_INACTIVE');
        }
        if (now.getTime() - session.lastActivityAt.getTime() > TOUCH_THROTTLE_MS) {
            await this.sessions.touch(scope, session.id, now);
        }
        return { userId: user.id, companyId: user.companyId, role: user.role, sessionId: session.id };
    }
};
exports.ValidateSessionUseCase = ValidateSessionUseCase;
exports.ValidateSessionUseCase = ValidateSessionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(session_policy_token_1.SESSION_POLICY)),
    __metadata("design:paramtypes", [auth_user_repository_1.AuthUserRepository,
        session_repository_1.SessionRepository,
        access_token_service_1.AccessTokenService, Object])
], ValidateSessionUseCase);
//# sourceMappingURL=validate-session.use-case.js.map