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
exports.SetScopeUseCase = exports.SetDeploymentScenarioUseCase = exports.GetTechnicalControlUseCase = void 0;
const common_1 = require("@nestjs/common");
const audit_log_writer_1 = require("../../../../common/audit/audit-log.writer");
const domain_error_1 = require("../../../../common/errors/domain-error");
const technical_control_repository_1 = require("../../domain/repositories/technical-control.repository");
const scopeOf = (p) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
let GetTechnicalControlUseCase = class GetTechnicalControlUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(principal, serviceId) {
        const state = await this.repo.getState(scopeOf(principal), serviceId);
        if (!state)
            throw new domain_error_1.DomainError('NOT_FOUND');
        return state;
    }
};
exports.GetTechnicalControlUseCase = GetTechnicalControlUseCase;
exports.GetTechnicalControlUseCase = GetTechnicalControlUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_control_repository_1.TechnicalControlRepository])
], GetTechnicalControlUseCase);
let SetDeploymentScenarioUseCase = class SetDeploymentScenarioUseCase {
    repo;
    audit;
    constructor(repo, audit) {
        this.repo = repo;
        this.audit = audit;
    }
    async execute(principal, serviceId, scenario, meta) {
        const result = await this.repo.setDeploymentScenario(scopeOf(principal), serviceId, scenario);
        if (!result)
            throw new domain_error_1.DomainError('NOT_FOUND');
        await this.audit.write({
            tenantId: principal.companyId,
            userId: principal.userId,
            action: 'service.deployment_scenario',
            resource: 'service',
            result: 'success',
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            beforeState: { service_id: serviceId, deployment_scenario: result.before },
            afterState: { service_id: serviceId, deployment_scenario: scenario },
        });
        return result.state;
    }
};
exports.SetDeploymentScenarioUseCase = SetDeploymentScenarioUseCase;
exports.SetDeploymentScenarioUseCase = SetDeploymentScenarioUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_control_repository_1.TechnicalControlRepository,
        audit_log_writer_1.AuditLogWriter])
], SetDeploymentScenarioUseCase);
let SetScopeUseCase = class SetScopeUseCase {
    repo;
    audit;
    constructor(repo, audit) {
        this.repo = repo;
        this.audit = audit;
    }
    async execute(principal, serviceId, counts, meta) {
        const result = await this.repo.setScope(scopeOf(principal), serviceId, counts);
        if (!result)
            throw new domain_error_1.DomainError('NOT_FOUND');
        await this.audit.write({
            tenantId: principal.companyId,
            userId: principal.userId,
            action: 'service.scope',
            resource: 'service',
            result: 'success',
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            beforeState: result.before ? { service_id: serviceId, ...result.before } : null,
            afterState: { service_id: serviceId, ...counts },
        });
        return result.state;
    }
};
exports.SetScopeUseCase = SetScopeUseCase;
exports.SetScopeUseCase = SetScopeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_control_repository_1.TechnicalControlRepository,
        audit_log_writer_1.AuditLogWriter])
], SetScopeUseCase);
//# sourceMappingURL=service-technical-control.use-cases.js.map