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
exports.UpdateServiceUseCase = void 0;
const common_1 = require("@nestjs/common");
const audit_log_writer_1 = require("../../../../common/audit/audit-log.writer");
const domain_error_1 = require("../../../../common/errors/domain-error");
const service_repository_1 = require("../../domain/repositories/service.repository");
const service_input_validation_1 = require("../service-input.validation");
let UpdateServiceUseCase = class UpdateServiceUseCase {
    services;
    audit;
    constructor(services, audit) {
        this.services = services;
        this.audit = audit;
    }
    async execute(principal, id, patch, meta) {
        await (0, service_input_validation_1.assertServiceInput)(this.services, patch);
        const change = await this.services.update({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, id, patch);
        if (!change)
            throw new domain_error_1.DomainError('NOT_FOUND');
        await this.audit.write({
            tenantId: principal.companyId,
            userId: principal.userId,
            action: 'service.update',
            resource: 'service',
            result: 'success',
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            beforeState: change.before.snapshot(),
            afterState: change.after.snapshot(),
        });
        return change.after;
    }
};
exports.UpdateServiceUseCase = UpdateServiceUseCase;
exports.UpdateServiceUseCase = UpdateServiceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [service_repository_1.ServiceRepository,
        audit_log_writer_1.AuditLogWriter])
], UpdateServiceUseCase);
//# sourceMappingURL=update-service.use-case.js.map