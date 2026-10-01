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
exports.LoginUseCase = void 0;
const common_1 = require("@nestjs/common");
const audit_log_writer_1 = require("../../../../common/audit/audit-log.writer");
const domain_error_1 = require("../../../../common/errors/domain-error");
const password_hasher_1 = require("../../domain/ports/password-hasher");
const auth_user_repository_1 = require("../../domain/repositories/auth-user.repository");
const session_issuer_service_1 = require("../services/session-issuer.service");
let LoginUseCase = class LoginUseCase {
    users;
    passwords;
    sessionIssuer;
    audit;
    constructor(users, passwords, sessionIssuer, audit) {
        this.users = users;
        this.passwords = passwords;
        this.sessionIssuer = sessionIssuer;
        this.audit = audit;
    }
    async execute(email, password, meta) {
        const now = new Date();
        const normalizedEmail = email.trim().toLowerCase();
        const credentials = await this.users.findCredentialsByEmail(normalizedEmail);
        if (!credentials) {
            await this.passwords.compareAgainstDummy(password);
            await this.log(meta, null, null, 'error', { reason: 'unknown_email' }, normalizedEmail);
            throw new domain_error_1.DomainError('INVALID_CREDENTIALS');
        }
        const scope = {
            companyId: credentials.companyId,
            userId: credentials.id,
            role: credentials.role,
        };
        if (credentials.isLocked(now)) {
            await this.log(meta, credentials.companyId, credentials.id, 'error', { reason: 'locked' });
            throw new domain_error_1.DomainError('ACCOUNT_LOCKED', {
                retry_after_seconds: credentials.secondsUntilUnlock(now),
            });
        }
        if (!(await this.passwords.compare(password, credentials.passwordHash))) {
            const next = credentials.afterFailedAttempt(now);
            await this.users.registerFailedLogin(scope, credentials.id, next);
            await this.log(meta, credentials.companyId, credentials.id, 'error', {
                reason: next.lockedUntil ? 'locked_now' : 'wrong_password',
            });
            if (next.lockedUntil) {
                throw new domain_error_1.DomainError('ACCOUNT_LOCKED', {
                    retry_after_seconds: Math.ceil((next.lockedUntil.getTime() - now.getTime()) / 1000),
                });
            }
            throw new domain_error_1.DomainError('INVALID_CREDENTIALS');
        }
        if (credentials.status !== 'active') {
            await this.log(meta, credentials.companyId, credentials.id, 'error', {
                reason: `status_${credentials.status}`,
            });
            throw new domain_error_1.DomainError('ACCOUNT_INACTIVE');
        }
        await this.users.registerSuccessfulLogin(scope, credentials.id, now);
        const user = await this.users.findById(scope, credentials.id);
        if (!user)
            throw new domain_error_1.DomainError('INVALID_CREDENTIALS');
        const issued = await this.sessionIssuer.issue(user, meta, now);
        await this.log(meta, user.companyId, user.id, 'success', { session_id: issued.session.id });
        return { user, ...issued };
    }
    log(meta, tenantId, userId, result, afterState, attemptedEmail) {
        return this.audit.write({
            tenantId,
            userId,
            attemptedEmail,
            action: 'auth.login',
            resource: 'session',
            result,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            afterState,
        });
    }
};
exports.LoginUseCase = LoginUseCase;
exports.LoginUseCase = LoginUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_user_repository_1.AuthUserRepository,
        password_hasher_1.PasswordHasher,
        session_issuer_service_1.SessionIssuer,
        audit_log_writer_1.AuditLogWriter])
], LoginUseCase);
//# sourceMappingURL=login.use-case.js.map