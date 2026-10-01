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
exports.RegisterCompanyUseCase = void 0;
const common_1 = require("@nestjs/common");
const audit_log_writer_1 = require("../../../../common/audit/audit-log.writer");
const domain_error_1 = require("../../../../common/errors/domain-error");
const access_key_code_1 = require("../../../../common/security/access-key-code");
const token_hasher_1 = require("../../../../common/security/token-hasher");
const company_entity_1 = require("../../domain/entities/company.entity");
const company_repository_1 = require("../../domain/repositories/company.repository");
const access_key_policy_token_1 = require("../access-key-policy.token");
let RegisterCompanyUseCase = class RegisterCompanyUseCase {
    companies;
    tokens;
    audit;
    accessKeyTtlHours;
    constructor(companies, tokens, audit, accessKeyTtlHours) {
        this.companies = companies;
        this.tokens = tokens;
        this.audit = audit;
        this.accessKeyTtlHours = accessKeyTtlHours;
    }
    async execute(principal, input, meta) {
        if (input.requiresDedicatedDatabase) {
            throw new domain_error_1.DomainError('DEDICATED_DATABASE_NOT_AVAILABLE');
        }
        const scope = {
            companyId: principal.companyId,
            userId: principal.userId,
            role: principal.role,
        };
        const name = company_entity_1.Company.normalizeName(input.name);
        const adminEmail = company_entity_1.Company.normalizeEmail(input.adminEmail);
        if (await this.companies.existsActiveWithName(scope, name)) {
            throw new domain_error_1.DomainError('COMPANY_NAME_TAKEN');
        }
        if (await this.companies.existsWithAdminEmail(scope, adminEmail)) {
            throw new domain_error_1.DomainError('ADMIN_EMAIL_TAKEN');
        }
        const accessKeyCode = (0, access_key_code_1.generateAccessKeyCode)();
        const { company, accessKey } = await this.companies.createWithAccessKey(scope, { name, adminEmail, isolationStrategy: company_entity_1.Company.isolationFor(input.requiresDedicatedDatabase) }, {
            codeHash: this.tokens.hash((0, access_key_code_1.normalizeAccessKeyCode)(accessKeyCode)),
            expiresAt: new Date(Date.now() + this.accessKeyTtlHours * 3_600_000),
            createdBy: principal.userId,
        });
        await this.audit.write({
            tenantId: null,
            userId: principal.userId,
            action: 'company.create',
            resource: 'company',
            result: 'success',
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            afterState: {
                company_id: company.id,
                name: company.name,
                admin_email: company.adminEmail,
                isolation_strategy: company.isolationStrategy,
                access_key_id: accessKey.id,
                access_key_expires_at: accessKey.expiresAt.toISOString(),
            },
        });
        return { company, accessKey, accessKeyCode };
    }
};
exports.RegisterCompanyUseCase = RegisterCompanyUseCase;
exports.RegisterCompanyUseCase = RegisterCompanyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(access_key_policy_token_1.ACCESS_KEY_TTL_HOURS)),
    __metadata("design:paramtypes", [company_repository_1.CompanyRepository,
        token_hasher_1.TokenHasher,
        audit_log_writer_1.AuditLogWriter, Number])
], RegisterCompanyUseCase);
//# sourceMappingURL=register-company.use-case.js.map