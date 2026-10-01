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
exports.TechnicalControlPrismaRepository = void 0;
const common_1 = require("@nestjs/common");
const technical_catalogs_1 = require("../../../../common/catalogs/technical-catalogs");
const domain_error_1 = require("../../../../common/errors/domain-error");
const validation_exception_1 = require("../../../../common/errors/validation.exception");
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const technical_control_repository_1 = require("../../domain/repositories/technical-control.repository");
const ASSET_PREFIX = 'AST-';
const CONNECTED_STATUSES = ['validated', 'active', 'scheduled'];
const ASSET_INCLUDE = {
    serviceAssets: { include: { service: { select: { id: true, name: true } } } },
    provisionings: { include: { automatedCapability: { select: { catalogCode: true } } } },
};
const CAPABILITY_SELECT = {
    catalogCode: true,
    category: true,
    supportedPlatforms: true,
    method: true,
    requiredPermissions: true,
    baseFrequency: true,
    generatedEvidence: true,
};
const asStrings = (value) => Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];
let TechnicalControlPrismaRepository = class TechnicalControlPrismaRepository extends technical_control_repository_1.TechnicalControlRepository {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    setDeploymentScenario(scope, serviceId, scenario) {
        return this.prisma.withScope(scope, async (tx) => {
            const service = await tx.service.findUnique({
                where: { id: serviceId },
                select: { id: true, deploymentScenario: true },
            });
            if (!service)
                return null;
            const allowed = technical_catalogs_1.SCENARIO_CAPABILITIES[scenario];
            const orphaned = await tx.asset.findMany({
                where: { serviceAssets: { some: { serviceId } }, connectionCategory: { notIn: [...allowed] } },
                select: { code: true },
            });
            if (orphaned.length > 0) {
                throw new domain_error_1.DomainError('CAPABILITY_NOT_APPLICABLE', { assets: orphaned.map((a) => a.code) });
            }
            await tx.service.update({ where: { id: serviceId }, data: { deploymentScenario: scenario } });
            return {
                before: service.deploymentScenario,
                state: await this.state(tx, serviceId),
            };
        });
    }
    setScope(scope, serviceId, counts) {
        return this.prisma.withScope(scope, async (tx) => {
            const service = await tx.service.findUnique({ where: { id: serviceId }, select: { id: true } });
            if (!service)
                return null;
            const existing = await tx.scope.findUnique({ where: { serviceId } });
            const data = {
                serverCount: counts.server_count,
                cloudCount: counts.cloud_count,
                appCount: counts.app_count,
                databaseCount: counts.database_count,
                endpointCount: counts.endpoint_count,
            };
            await tx.scope.upsert({
                where: { serviceId },
                create: { tenantId: scope.companyId, serviceId, ...data },
                update: data,
            });
            return {
                before: existing
                    ? {
                        server_count: existing.serverCount,
                        cloud_count: existing.cloudCount,
                        app_count: existing.appCount,
                        database_count: existing.databaseCount,
                        endpoint_count: existing.endpointCount,
                    }
                    : null,
                state: await this.state(tx, serviceId),
            };
        });
    }
    getState(scope, serviceId) {
        return this.prisma.withScope(scope, async (tx) => {
            const service = await tx.service.findUnique({ where: { id: serviceId }, select: { id: true } });
            return service ? this.state(tx, serviceId) : null;
        });
    }
    createAsset(scope, input) {
        return this.prisma.withScope(scope, async (tx) => {
            const organization = await tx.organization.findUnique({
                where: { companyId: scope.companyId },
                select: { id: true },
            });
            if (!organization)
                throw new domain_error_1.DomainError('ORGANIZATION_NOT_DECLARED');
            const services = await tx.service.findMany({
                where: { id: { in: input.serviceIds }, organizationId: organization.id },
                select: { id: true, name: true, deploymentScenario: true },
            });
            if (services.length !== new Set(input.serviceIds).size) {
                throw new validation_exception_1.ValidationException([{ field: 'service_ids', code: 'invalid' }]);
            }
            for (const service of services) {
                if (!service.deploymentScenario) {
                    throw new domain_error_1.DomainError('DEPLOYMENT_SCENARIO_NOT_SET', { service: service.name });
                }
                const allowed = technical_catalogs_1.SCENARIO_CAPABILITIES[service.deploymentScenario];
                if (!allowed.includes(input.connectionCategory)) {
                    throw new domain_error_1.DomainError('CAPABILITY_NOT_APPLICABLE', { service: service.name });
                }
            }
            if (input.responsibleId) {
                const responsible = await tx.organizationResponsible.findFirst({
                    where: { id: input.responsibleId, organizationId: organization.id },
                    select: { id: true },
                });
                if (!responsible)
                    throw new validation_exception_1.ValidationException([{ field: 'responsible_id', code: 'invalid' }]);
            }
            const capability = await tx.automatedCapability.findUnique({
                where: { catalogCode: input.connectionCategory },
                select: { id: true },
            });
            if (!capability)
                throw new Error(`Falta sembrar la capacidad ${input.connectionCategory}`);
            await tx.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${organization.id}))`;
            const codes = await tx.asset.findMany({ where: { organizationId: organization.id }, select: { code: true } });
            const next = codes.reduce((max, { code }) => Math.max(max, Number(code.slice(ASSET_PREFIX.length)) || 0), 0) + 1;
            const asset = await tx.asset.create({
                data: {
                    tenantId: scope.companyId,
                    organizationId: organization.id,
                    responsibleId: input.responsibleId,
                    code: `${ASSET_PREFIX}${String(next).padStart(4, '0')}`,
                    connectionCategory: input.connectionCategory,
                    type: technical_catalogs_1.ASSET_TYPE_BY_CATEGORY[input.connectionCategory],
                    name: input.name,
                    platform: input.platform,
                    ipAddress: input.ipAddress,
                    location: input.location,
                    criticality: input.criticality,
                    tags: input.tags,
                    origin: 'declared',
                    technicalCoverage: technical_catalogs_1.NO_COVERAGE,
                },
                select: { id: true },
            });
            await tx.serviceAsset.createMany({
                data: input.serviceIds.map((serviceId) => ({ tenantId: scope.companyId, assetId: asset.id, serviceId })),
            });
            await tx.assetProvisioning.create({
                data: {
                    tenantId: scope.companyId,
                    assetId: asset.id,
                    automatedCapabilityId: capability.id,
                    technicalCoverage: technical_catalogs_1.NO_COVERAGE,
                    encryptedCredentials: input.encryptedCredentials,
                },
            });
            return this.readAsset(tx, asset.id);
        });
    }
    listAssets(scope, filters, page) {
        return this.prisma.withScope(scope, async (tx) => {
            const where = {
                organization: { companyId: scope.companyId },
                ...(filters.serviceId ? { serviceAssets: { some: { serviceId: filters.serviceId } } } : {}),
                ...(filters.connectionCategory ? { connectionCategory: filters.connectionCategory } : {}),
                ...(filters.operationalStatus ? { operationalStatus: filters.operationalStatus } : {}),
            };
            const total = await tx.asset.count({ where });
            const rows = await tx.asset.findMany({
                where,
                orderBy: { code: 'asc' },
                skip: (page.page - 1) * page.pageSize,
                take: page.pageSize,
                include: ASSET_INCLUDE,
            });
            return { items: rows.map((r) => this.toAsset(r)), total, page: page.page, pageSize: page.pageSize };
        });
    }
    findAsset(scope, id) {
        return this.prisma.withScope(scope, async (tx) => {
            const row = await tx.asset.findUnique({ where: { id }, include: ASSET_INCLUDE });
            return row ? this.toAsset(row) : null;
        });
    }
    findProbeTarget(scope, id) {
        return this.prisma.withScope(scope, async (tx) => {
            const row = await tx.asset.findUnique({
                where: { id },
                select: {
                    id: true,
                    connectionCategory: true,
                    platform: true,
                    ipAddress: true,
                    provisionings: { select: { connectionStatus: true, encryptedCredentials: true }, take: 1 },
                },
            });
            const provisioning = row?.provisionings[0];
            if (!row || !provisioning)
                return null;
            return {
                assetId: row.id,
                category: row.connectionCategory,
                platform: row.platform,
                ipAddress: row.ipAddress,
                connectionStatus: provisioning.connectionStatus,
                encryptedCredentials: provisioning.encryptedCredentials,
            };
        });
    }
    recordValidation(scope, id, result) {
        return this.prisma.withScope(scope, async (tx) => {
            const before = await this.readAsset(tx, id);
            if (before.provisioning.isActive)
                throw new domain_error_1.DomainError('ASSET_ALREADY_ACTIVE');
            const provisioning = await tx.assetProvisioning.findFirstOrThrow({ where: { assetId: id }, select: { id: true } });
            await tx.assetProvisioning.update({
                where: { id: provisioning.id },
                data: result.ok
                    ? { connectionStatus: 'validated', lastValidatedAt: new Date(), technicalCoverage: result.technicalCoverage }
                    : { connectionStatus: 'failed' },
            });
            if (result.ok && result.technicalCoverage) {
                await tx.asset.update({ where: { id }, data: { technicalCoverage: result.technicalCoverage } });
            }
            return { before, after: await this.readAsset(tx, id) };
        });
    }
    activateAsset(scope, id, operationalStatus) {
        return this.prisma.withScope(scope, async (tx) => {
            const before = await this.readAsset(tx, id);
            if (before.provisioning.isActive)
                throw new domain_error_1.DomainError('ASSET_ALREADY_ACTIVE');
            const changed = await tx.assetProvisioning.updateMany({
                where: { id: before.provisioning.id, connectionStatus: 'validated', isActive: false },
                data: { connectionStatus: 'active', isActive: true },
            });
            if (changed.count === 0)
                throw new domain_error_1.DomainError('ASSET_NOT_VALIDATED');
            await tx.asset.update({ where: { id }, data: { operationalStatus } });
            return { before, after: await this.readAsset(tx, id) };
        });
    }
    scheduleAsset(scope, id, frequency) {
        return this.prisma.withScope(scope, async (tx) => {
            const before = await this.readAsset(tx, id);
            if (!before.provisioning.isActive)
                throw new domain_error_1.DomainError('ASSET_NOT_ACTIVE');
            if (!technical_catalogs_1.FREQUENCIES_BY_CATEGORY[before.connectionCategory].includes(frequency)) {
                throw new domain_error_1.DomainError('FREQUENCY_NOT_SUPPORTED', {
                    supported: technical_catalogs_1.FREQUENCIES_BY_CATEGORY[before.connectionCategory],
                });
            }
            await tx.assetProvisioning.update({
                where: { id: before.provisioning.id },
                data: { connectionStatus: 'scheduled', scheduleFrequency: frequency },
            });
            return { before, after: await this.readAsset(tx, id) };
        });
    }
    async readAsset(tx, id) {
        const row = await tx.asset.findUnique({ where: { id }, include: ASSET_INCLUDE });
        if (!row)
            throw new domain_error_1.DomainError('NOT_FOUND');
        return this.toAsset(row);
    }
    toAsset(row) {
        const p = row.provisionings[0];
        return {
            id: row.id,
            code: row.code,
            name: row.name,
            connectionCategory: row.connectionCategory,
            type: row.type,
            platform: row.platform,
            ipAddress: row.ipAddress,
            location: row.location,
            criticality: row.criticality,
            tags: asStrings(row.tags),
            origin: row.origin,
            status: row.status,
            operationalStatus: row.operationalStatus,
            technicalCoverage: row.technicalCoverage,
            services: row.serviceAssets.map((s) => s.service).sort((a, b) => a.name.localeCompare(b.name)),
            provisioning: {
                id: p.id,
                automatedCapabilityCode: p.automatedCapability.catalogCode,
                connectionStatus: p.connectionStatus,
                lastValidatedAt: p.lastValidatedAt,
                isActive: p.isActive,
                scheduleFrequency: p.scheduleFrequency,
            },
        };
    }
    async state(tx, serviceId) {
        const service = await tx.service.findUniqueOrThrow({
            where: { id: serviceId },
            select: { deploymentScenario: true, scope: true },
        });
        const scenario = service.deploymentScenario;
        const capabilities = scenario
            ? (await tx.automatedCapability.findMany({
                where: { catalogCode: { in: [...technical_catalogs_1.SCENARIO_CAPABILITIES[scenario]] } },
                select: CAPABILITY_SELECT,
                orderBy: { catalogCode: 'asc' },
            })).map((c) => ({
                catalogCode: c.catalogCode,
                category: c.category,
                supportedPlatforms: asStrings(c.supportedPlatforms),
                method: c.method,
                requiredPermissions: asStrings(c.requiredPermissions),
                baseFrequency: c.baseFrequency,
                generatedEvidence: c.generatedEvidence,
            }))
            : [];
        let declared = null;
        if (service.scope) {
            const counts = {
                server_count: service.scope.serverCount,
                cloud_count: service.scope.cloudCount,
                app_count: service.scope.appCount,
                database_count: service.scope.databaseCount,
                endpoint_count: service.scope.endpointCount,
            };
            const connected = await this.connectedCounts(tx, serviceId);
            declared = {
                id: service.scope.id,
                counts,
                declaredTotal: technical_catalogs_1.SCOPE_KEYS.reduce((sum, k) => sum + counts[k], 0),
                connectedTotal: technical_catalogs_1.SCOPE_KEYS.reduce((sum, k) => sum + connected[k], 0),
                connected,
            };
        }
        return { deploymentScenario: scenario, applicableCapabilities: capabilities, scope: declared };
    }
    async connectedCounts(tx, serviceId) {
        const assets = await tx.asset.findMany({
            where: {
                serviceAssets: { some: { serviceId } },
                provisionings: { some: { connectionStatus: { in: [...CONNECTED_STATUSES] } } },
            },
            select: { type: true },
        });
        const counts = {
            server_count: 0,
            cloud_count: 0,
            app_count: 0,
            database_count: 0,
            endpoint_count: 0,
        };
        for (const { type } of assets) {
            const key = technical_catalogs_1.SCOPE_KEY_BY_ASSET_TYPE[type];
            if (key)
                counts[key] += 1;
        }
        return counts;
    }
};
exports.TechnicalControlPrismaRepository = TechnicalControlPrismaRepository;
exports.TechnicalControlPrismaRepository = TechnicalControlPrismaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TechnicalControlPrismaRepository);
//# sourceMappingURL=technical-control.prisma.repository.js.map