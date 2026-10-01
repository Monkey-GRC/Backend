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
exports.SessionIssuer = void 0;
const common_1 = require("@nestjs/common");
const token_hasher_1 = require("../../../../common/security/token-hasher");
const session_entity_1 = require("../../domain/entities/session.entity");
const access_token_service_1 = require("../../domain/ports/access-token.service");
const session_repository_1 = require("../../domain/repositories/session.repository");
const session_policy_token_1 = require("../session-policy.token");
let SessionIssuer = class SessionIssuer {
    sessions;
    tokens;
    accessTokens;
    policy;
    constructor(sessions, tokens, accessTokens, policy) {
        this.sessions = sessions;
        this.tokens = tokens;
        this.accessTokens = accessTokens;
        this.policy = policy;
    }
    async issue(user, meta, now = new Date()) {
        const refreshToken = this.tokens.generate();
        const session = await this.sessions.create({ companyId: user.companyId, userId: user.id, role: user.role }, {
            userId: user.id,
            refreshTokenHash: this.tokens.hash(refreshToken),
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            createdAt: now,
            expiresAt: session_entity_1.Session.expiresAtFor(now, this.policy),
        });
        const accessToken = await this.accessTokens.sign({
            sub: user.id,
            cid: user.companyId,
            role: user.role,
            sid: session.id,
        });
        return { session, accessToken, refreshToken };
    }
};
exports.SessionIssuer = SessionIssuer;
exports.SessionIssuer = SessionIssuer = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(session_policy_token_1.SESSION_POLICY)),
    __metadata("design:paramtypes", [session_repository_1.SessionRepository,
        token_hasher_1.TokenHasher,
        access_token_service_1.AccessTokenService, Object])
], SessionIssuer);
//# sourceMappingURL=session-issuer.service.js.map