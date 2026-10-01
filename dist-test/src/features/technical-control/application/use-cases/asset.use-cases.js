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
exports.ScheduleAssetUseCase = exports.ActivateAssetUseCase = exports.ValidateAssetUseCase = exports.GetAssetUseCase = exports.ListAssetsUseCase = exports.CreateAssetUseCase = void 0;
const common_1 = require("@nestjs/common");
const audit_log_writer_1 = require("../../../../common/audit/audit-log.writer");
const technical_catalogs_1 = require("../../../../common/catalogs/technical-catalogs");
const domain_error_1 = require("../../../../common/errors/domain-error");
const validation_exception_1 = require("../../../../common/errors/validation.exception");
const credential_cipher_1 = require("../../../../common/security/credential-cipher");
const connection_probe_1 = require("../../domain/ports/connection-probe");
const technical_control_repository_1 = require("../../domain/repositories/technical-control.repository");
const credentials_validation_1 = require("../credentials.validation");
const scopeOf = (p) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const snapshot = (a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    connection_category: a.connectionCategory,
    type: a.type,
    platform: a.platform,
    service_ids: a.services.map((s) => s.id),
    connection_status: a.provisioning.connectionStatus,
    is_active: a.provisioning.isActive,
    operational_status: a.operationalStatus,
    schedule_frequency: a.provisioning.scheduleFrequency,
});
class AssetAudit {
    audit;
    constructor(audit) {
        this.audit = audit;
    }
    write({ principal, meta, action, before, after, result = 'success' }) {
        return this.audit.write({
            tenantId: principal.companyId,
            userId: principal.userId,
            action,
            resource: 'asset',
            result,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            beforeState: before ? snapshot(before) : null,
            afterState: after ? snapshot(after) : null,
        });
    }
}
let CreateAssetUseCase = class CreateAssetUseCase {
    repo;
    cipher;
    audit;
    constructor(repo, cipher, audit) {
        this.repo = repo;
        this.cipher = cipher;
        this.audit = audit;
    }
    async execute(principal, request, meta) {
        const { errors, toStore } = (0, credentials_validation_1.normalizeCredentials)(request.connectionCategory, request.credentials);
        if (errors.length > 0)
            throw new validation_exception_1.ValidationException(errors);
        const asset = await this.repo.createAsset(scopeOf(principal), {
            name: request.name,
            connectionCategory: request.connectionCategory,
            platform: request.platform,
            ipAddress: request.ipAddress,
            location: request.location,
            criticality: request.criticality ?? technical_catalogs_1.DEFAULT_CRITICALITY,
            tags: request.tags ?? [],
            serviceIds: request.serviceIds,
            responsibleId: request.responsibleId,
            encryptedCredentials: toStore ? this.cipher.encrypt(toStore) : null,
        });
        await new AssetAudit(this.audit).write({ principal, meta, action: 'asset.create', before: null, after: asset });
        return asset;
    }
};
exports.CreateAssetUseCase = CreateAssetUseCase;
exports.CreateAssetUseCase = CreateAssetUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_control_repository_1.TechnicalControlRepository,
        credential_cipher_1.CredentialCipher,
        audit_log_writer_1.AuditLogWriter])
], CreateAssetUseCase);
let ListAssetsUseCase = class ListAssetsUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    execute(principal, filters, page) {
        return this.repo.listAssets(scopeOf(principal), filters, page);
    }
};
exports.ListAssetsUseCase = ListAssetsUseCase;
exports.ListAssetsUseCase = ListAssetsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_control_repository_1.TechnicalControlRepository])
], ListAssetsUseCase);
let GetAssetUseCase = class GetAssetUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(principal, id) {
        const asset = await this.repo.findAsset(scopeOf(principal), id);
        if (!asset)
            throw new domain_error_1.DomainError('NOT_FOUND');
        return asset;
    }
};
exports.GetAssetUseCase = GetAssetUseCase;
exports.GetAssetUseCase = GetAssetUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_control_repository_1.TechnicalControlRepository])
], GetAssetUseCase);
let ValidateAssetUseCase = class ValidateAssetUseCase {
    repo;
    probe;
    cipher;
    audit;
    constructor(repo, probe, cipher, audit) {
        this.repo = repo;
        this.probe = probe;
        this.cipher = cipher;
        this.audit = audit;
    }
    async execute(principal, id, meta) {
        const scope = scopeOf(principal);
        const target = await this.repo.findProbeTarget(scope, id);
        if (!target)
            throw new domain_error_1.DomainError('NOT_FOUND');
        if (target.connectionStatus === 'active' || target.connectionStatus === 'scheduled') {
            throw new domain_error_1.DomainError('ASSET_ALREADY_ACTIVE');
        }
        const credentials = target.encryptedCredentials ? this.cipher.decrypt(target.encryptedCredentials) : null;
        const result = await this.probe.validate({
            category: target.category,
            platform: target.platform,
            ipAddress: target.ipAddress,
            credentials,
        });
        const audit = new AssetAudit(this.audit);
        if (!result.ok) {
            const { before, after } = await this.repo.recordValidation(scope, id, { ok: false });
            await audit.write({ principal, meta, action: 'asset.validate', before, after, result: 'error' });
            throw new validation_exception_1.ValidationException(result.fields, { code: 'CONNECTION_FAILED', messageKey: 'asset.connection_failed' });
        }
        const { before, after } = await this.repo.recordValidation(scope, id, {
            ok: true,
            technicalCoverage: result.technicalCoverage,
        });
        await audit.write({ principal, meta, action: 'asset.validate', before, after });
        return { asset: after, checksAvailable: result.checksAvailable };
    }
};
exports.ValidateAssetUseCase = ValidateAssetUseCase;
exports.ValidateAssetUseCase = ValidateAssetUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_control_repository_1.TechnicalControlRepository,
        connection_probe_1.ConnectionProbe,
        credential_cipher_1.CredentialCipher,
        audit_log_writer_1.AuditLogWriter])
], ValidateAssetUseCase);
let ActivateAssetUseCase = class ActivateAssetUseCase {
    repo;
    probe;
    audit;
    constructor(repo, probe, audit) {
        this.repo = repo;
        this.probe = probe;
        this.audit = audit;
    }
    async execute(principal, id, meta) {
        const { before, after } = await this.repo.activateAsset(scopeOf(principal), id, this.probe.confirmsOperation ? 'operational' : 'warning');
        await new AssetAudit(this.audit).write({ principal, meta, action: 'asset.activate', before, after });
        return after;
    }
};
exports.ActivateAssetUseCase = ActivateAssetUseCase;
exports.ActivateAssetUseCase = ActivateAssetUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_control_repository_1.TechnicalControlRepository,
        connection_probe_1.ConnectionProbe,
        audit_log_writer_1.AuditLogWriter])
], ActivateAssetUseCase);
let ScheduleAssetUseCase = class ScheduleAssetUseCase {
    repo;
    audit;
    constructor(repo, audit) {
        this.repo = repo;
        this.audit = audit;
    }
    async execute(principal, id, frequency, meta) {
        const { before, after } = await this.repo.scheduleAsset(scopeOf(principal), id, frequency);
        await new AssetAudit(this.audit).write({ principal, meta, action: 'asset.schedule', before, after });
        return after;
    }
};
exports.ScheduleAssetUseCase = ScheduleAssetUseCase;
exports.ScheduleAssetUseCase = ScheduleAssetUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [technical_control_repository_1.TechnicalControlRepository,
        audit_log_writer_1.AuditLogWriter])
], ScheduleAssetUseCase);
//# sourceMappingURL=asset.use-cases.js.map