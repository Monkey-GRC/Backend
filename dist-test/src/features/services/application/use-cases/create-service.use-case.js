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
exports.CreateServiceUseCase = void 0;
const common_1 = require("@nestjs/common");
const audit_log_writer_1 = require("../../../../common/audit/audit-log.writer");
const service_repository_1 = require("../../domain/repositories/service.repository");
const service_input_validation_1 = require("../service-input.validation");
let CreateServiceUseCase = class CreateServiceUseCase {
    services;
    audit;
    constructor(services, audit) {
        this.services = services;
        this.audit = audit;
    }
    async execute(principal, input, meta) {
        await (0, service_input_validation_1.assertServiceInput)(this.services, input);
        const created = await this.services.create({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, input);
        await this.audit.write({
            tenantId: principal.companyId,
            userId: principal.userId,
            action: 'service.create',
            resource: 'service',
            result: 'success',
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            beforeState: null,
            afterState: created.snapshot(),
        });
        return created;
    }
};
exports.CreateServiceUseCase = CreateServiceUseCase;
exports.CreateServiceUseCase = CreateServiceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [service_repository_1.ServiceRepository,
        audit_log_writer_1.AuditLogWriter])
], CreateServiceUseCase);
//# sourceMappingURL=create-service.use-case.js.map