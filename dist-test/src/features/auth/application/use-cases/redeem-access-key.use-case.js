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
exports.RedeemAccessKeyUseCase = void 0;
const common_1 = require("@nestjs/common");
const audit_log_writer_1 = require("../../../../common/audit/audit-log.writer");
const domain_error_1 = require("../../../../common/errors/domain-error");
const access_key_code_1 = require("../../../../common/security/access-key-code");
const token_hasher_1 = require("../../../../common/security/token-hasher");
const password_hasher_1 = require("../../domain/ports/password-hasher");
const access_key_redemption_repository_1 = require("../../domain/repositories/access-key-redemption.repository");
const auth_user_repository_1 = require("../../domain/repositories/auth-user.repository");
const session_issuer_service_1 = require("../services/session-issuer.service");
let RedeemAccessKeyUseCase = class RedeemAccessKeyUseCase {
    redemptions;
    users;
    passwords;
    tokens;
    sessionIssuer;
    audit;
    constructor(redemptions, users, passwords, tokens, sessionIssuer, audit) {
        this.redemptions = redemptions;
        this.users = users;
        this.passwords = passwords;
        this.tokens = tokens;
        this.sessionIssuer = sessionIssuer;
        this.audit = audit;
    }
    async execute(input, meta) {
        const now = new Date();
        const email = input.email.trim().toLowerCase();
        const code = (0, access_key_code_1.normalizeAccessKeyCode)(input.code);
        const key = code ? await this.redemptions.findByCodeHash(this.tokens.hash(code)) : null;
        if (!key) {
            await this.log(meta, null, null, 'error', { reason: 'unknown_key' }, email);
            throw new domain_error_1.DomainError('ACCESS_KEY_INVALID');
        }
        const scope = { companyId: key.companyId, role: 'admin_empresa' };
        const company = await this.redemptions.findCompany(scope);
        if (!company || company.status !== 'active') {
            await this.log(meta, key.companyId, null, 'error', { reason: 'company_not_active' }, email);
            throw new domain_error_1.DomainError('ACCESS_KEY_INVALID');
        }
        const state = key.stateAt(now);
        if (state !== 'redeemable') {
            await this.log(meta, key.companyId, null, 'error', { reason: `key_${state}` }, email);
            if (state === 'used')
                throw new domain_error_1.DomainError('ACCESS_KEY_ALREADY_USED');
            if (state === 'expired')
                throw new domain_error_1.DomainError('ACCESS_KEY_EXPIRED');
            throw new domain_error_1.DomainError('ACCESS_KEY_INVALID');
        }
        if (email !== company.adminEmail.toLowerCase()) {
            await this.log(meta, key.companyId, null, 'error', { reason: 'email_mismatch' }, email);
            throw new domain_error_1.DomainError('ACCESS_KEY_EMAIL_MISMATCH');
        }
        const outcome = await this.redemptions.redeem(scope, key.id, {
            email,
            name: input.name.trim(),
            lastName: input.lastName.trim(),
            passwordHash: await this.passwords.hash(input.password),
        }, now);
        if (outcome.kind === 'already_used') {
            await this.log(meta, key.companyId, null, 'error', { reason: 'key_used_concurrently' }, email);
            throw new domain_error_1.DomainError('ACCESS_KEY_ALREADY_USED');
        }
        if (outcome.kind === 'email_taken') {
            await this.log(meta, key.companyId, null, 'error', { reason: 'email_taken' }, email);
            throw new domain_error_1.DomainError('EMAIL_TAKEN');
        }
        const userScope = { ...scope, userId: outcome.userId };
        await this.users.registerSuccessfulLogin(userScope, outcome.userId, now);
        const user = await this.users.findById(userScope, outcome.userId);
        if (!user)
            throw new domain_error_1.DomainError('ACCESS_KEY_INVALID');
        const issued = await this.sessionIssuer.issue(user, meta, now);
        await this.log(meta, user.companyId, user.id, 'success', { access_key_id: key.id });
        await this.audit.write({
            tenantId: user.companyId,
            userId: user.id,
            action: 'user.create',
            resource: 'user',
            result: 'success',
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            afterState: { user_id: user.id, email: user.email, role: user.role, via: 'access_key' },
        });
        return { user, ...issued };
    }
    log(meta, tenantId, userId, result, afterState, attemptedEmail) {
        return this.audit.write({
            tenantId,
            userId,
            attemptedEmail,
            action: 'auth.redeem',
            resource: 'access_key',
            result,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            afterState,
        });
    }
};
exports.RedeemAccessKeyUseCase = RedeemAccessKeyUseCase;
exports.RedeemAccessKeyUseCase = RedeemAccessKeyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [access_key_redemption_repository_1.AccessKeyRedemptionRepository,
        auth_user_repository_1.AuthUserRepository,
        password_hasher_1.PasswordHasher,
        token_hasher_1.TokenHasher,
        session_issuer_service_1.SessionIssuer,
        audit_log_writer_1.AuditLogWriter])
], RedeemAccessKeyUseCase);
//# sourceMappingURL=redeem-access-key.use-case.js.map