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
exports.SaveOrganizationalContextUseCase = void 0;
const common_1 = require("@nestjs/common");
const audit_log_writer_1 = require("../../../../common/audit/audit-log.writer");
const onboarding_catalogs_1 = require("../../../../common/catalogs/onboarding-catalogs");
const validation_exception_1 = require("../../../../common/errors/validation.exception");
const organizational_context_repository_1 = require("../../domain/repositories/organizational-context.repository");
let SaveOrganizationalContextUseCase = class SaveOrganizationalContextUseCase {
    contexts;
    audit;
    constructor(contexts, audit) {
        this.contexts = contexts;
        this.audit = audit;
    }
    async execute(principal, input, meta) {
        if (input.regulationCodes.includes(onboarding_catalogs_1.REGULATION_NONE) && input.regulationCodes.length > 1) {
            throw new validation_exception_1.ValidationException([
                { field: 'regulation_codes', code: 'regulation.none_exclusive' },
            ]);
        }
        const existing = new Set(await this.contexts.existingRegulationCodes(input.regulationCodes));
        if (input.regulationCodes.some((code) => !existing.has(code))) {
            throw new validation_exception_1.ValidationException([{ field: 'regulation_codes', code: 'enum.invalid' }]);
        }
        const scope = {
            companyId: principal.companyId,
            userId: principal.userId,
            role: principal.role,
        };
        const { before, after } = await this.contexts.save(scope, input);
        await this.audit.write({
            tenantId: principal.companyId,
            userId: principal.userId,
            action: 'organizational_context.save',
            resource: 'organization',
            result: 'success',
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            beforeState: before.exists ? before.snapshot() : null,
            afterState: after.snapshot(),
        });
        return after;
    }
};
exports.SaveOrganizationalContextUseCase = SaveOrganizationalContextUseCase;
exports.SaveOrganizationalContextUseCase = SaveOrganizationalContextUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [organizational_context_repository_1.OrganizationalContextRepository,
        audit_log_writer_1.AuditLogWriter])
], SaveOrganizationalContextUseCase);
//# sourceMappingURL=save-organizational-context.use-case.js.map