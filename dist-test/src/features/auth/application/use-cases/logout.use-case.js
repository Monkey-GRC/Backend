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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutUseCase = void 0;
const common_1 = require("@nestjs/common");
const audit_log_writer_1 = require("../../../../common/audit/audit-log.writer");
const token_hasher_1 = require("../../../../common/security/token-hasher");
const session_repository_1 = require("../../domain/repositories/session.repository");
let LogoutUseCase = class LogoutUseCase {
    sessions;
    tokens;
    audit;
    constructor(sessions, tokens, audit) {
        this.sessions = sessions;
        this.tokens = tokens;
        this.audit = audit;
    }
    async execute(refreshToken, meta) {
        if (!refreshToken)
            return;
        const session = await this.sessions.findByRefreshTokenHash(this.tokens.hash(refreshToken));
        if (!session || session.revokedAt)
            return;
        await this.sessions.revoke({ companyId: session.companyId, userId: session.userId }, session.id, new Date());
        await this.audit.write({
            tenantId: session.companyId,
            userId: session.userId,
            action: 'auth.logout',
            resource: 'session',
            result: 'success',
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            afterState: { session_id: session.id },
        });
    }
};
exports.LogoutUseCase = LogoutUseCase;
exports.LogoutUseCase = LogoutUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [session_repository_1.SessionRepository,
        token_hasher_1.TokenHasher,
        audit_log_writer_1.AuditLogWriter])
], LogoutUseCase);
//# sourceMappingURL=logout.use-case.js.map