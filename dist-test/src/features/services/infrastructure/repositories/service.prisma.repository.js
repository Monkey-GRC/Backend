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
exports.ServicePrismaRepository = void 0;
const common_1 = require("@nestjs/common");
const domain_error_1 = require("../../../../common/errors/domain-error");
const service_catalogs_1 = require("../../../../common/catalogs/service-catalogs");
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const service_entity_1 = require("../../domain/entities/service.entity");
const service_repository_1 = require("../../domain/repositories/service.repository");
const catalog_cloner_1 = require("../catalog-cloner");
const CLONING_TRANSACTION = { timeoutMs: 60_000 };
const evaluationPeriodFor = (date) => `${date.getUTCFullYear()}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
const startOfDayUtc = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const toDbAvailability = (value) => (value === '24x7' ? 'h24x7' : value);
const fromDbAvailability = (value) => (value === 'h24x7' ? '24x7' : value);
const subserviceKey = (s) => JSON.stringify([s.type, s.provider, s.serviceProvided, s.responsibility]);
const withMandatory = (criteria) => criteria.includes(service_catalogs_1.TRUST_CRITERION_MANDATORY) ? criteria : [service_catalogs_1.TRUST_CRITERION_MANDATORY, ...criteria];
let ServicePrismaRepository = class ServicePrismaRepository extends service_repository_1.ServiceRepository {
    prisma;
    cloner = new catalog_cloner_1.CatalogCloner();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async existingFrameworkCodes(codes) {
        const rows = await this.prisma.framework.findMany({
            where: { code: { in: codes } },
            select: { code: true },
            distinct: ['code'],
        });
        return rows.map((r) => r.code);
    }
    async existingRegulationCodes(codes) {
        const rows = await this.prisma.regulation.findMany({
            where: { code: { in: codes } },
            select: { code: true },
        });
        return rows.map((r) => r.code);
    }
    create(scope, input) {
        return this.prisma.withScope(scope, async (tx) => {
            const organization = await tx.organization.findUnique({
                where: { companyId: scope.companyId },
                select: { id: true },
            });
            if (!organization)
                throw new domain_error_1.DomainError('ORGANIZATION_NOT_DECLARED');
            await this.assertNameFree(tx, organization.id, input.name, null);
            const service = await tx.service.create({
                data: {
                    tenantId: scope.companyId,
                    organizationId: organization.id,
                    name: input.name,
                    description: input.description,
                    scopeStatement: input.scopeStatement,
                    type: input.type,
                    industriesServed: input.industriesServed,
                    activeClientCount: input.activeClientCount,
                    countries: input.countries,
                    dataTypes: input.dataTypes,
                    expectedAvailability: toDbAvailability(input.expectedAvailability),
                    previousCertification: input.previousCertification,
                },
                select: { id: true },
            });
            await this.replaceTrustCriteria(tx, scope.companyId, service.id, withMandatory(input.trustCriteria));
            await this.replaceRegulations(tx, scope.companyId, service.id, input.regulationCodes);
            await this.syncSubservices(tx, scope.companyId, service.id, input.subserviceOrganizations);
            await this.upsertSystemDescription(tx, scope.companyId, service.id, input.systemDescription);
            await this.syncFrameworks(tx, scope.companyId, service.id, input.frameworkCodes);
            await this.cloneContractedFrameworks(tx, scope.companyId, service.id);
            return this.read(tx, service.id);
        }, CLONING_TRANSACTION);
    }
    list(scope, request) {
        return this.prisma.withScope(scope, async (tx) => {
            const where = { organization: { companyId: scope.companyId } };
            const total = await tx.service.count({ where });
            const rows = await tx.service.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (request.page - 1) * request.pageSize,
                take: request.pageSize,
                select: { id: true },
            });
            const items = [];
            for (const row of rows)
                items.push(await this.read(tx, row.id));
            return { items, total, page: request.page, pageSize: request.pageSize };
        });
    }
    findById(scope, id) {
        return this.prisma.withScope(scope, (tx) => this.readOrNull(tx, id));
    }
    update(scope, id, patch) {
        return this.prisma.withScope(scope, async (tx) => {
            const before = await this.readOrNull(tx, id);
            if (!before)
                return null;
            if (patch.name !== undefined) {
                await this.assertNameFree(tx, before.data.organizationId, patch.name, id);
            }
            await tx.service.update({
                where: { id },
                data: {
                    name: patch.name,
                    description: patch.description,
                    scopeStatement: patch.scopeStatement,
                    type: patch.type,
                    industriesServed: patch.industriesServed,
                    activeClientCount: patch.activeClientCount,
                    countries: patch.countries,
                    dataTypes: patch.dataTypes,
                    expectedAvailability: patch.expectedAvailability === undefined
                        ? undefined
                        : toDbAvailability(patch.expectedAvailability),
                    previousCertification: patch.previousCertification,
                },
            });
            if (patch.trustCriteria) {
                await this.replaceTrustCriteria(tx, scope.companyId, id, withMandatory(patch.trustCriteria));
            }
            if (patch.regulationCodes) {
                await this.replaceRegulations(tx, scope.companyId, id, patch.regulationCodes);
            }
            if (patch.subserviceOrganizations) {
                await this.syncSubservices(tx, scope.companyId, id, patch.subserviceOrganizations);
            }
            if (patch.systemDescription) {
                await this.upsertSystemDescription(tx, scope.companyId, id, patch.systemDescription);
            }
            if (patch.frameworkCodes) {
                await this.syncFrameworks(tx, scope.companyId, id, patch.frameworkCodes);
            }
            if (patch.trustCriteria || patch.frameworkCodes) {
                await this.cloneContractedFrameworks(tx, scope.companyId, id);
            }
            return { before, after: await this.read(tx, id) };
        }, CLONING_TRANSACTION);
    }
    setSystemDescription(scope, id, input) {
        return this.prisma.withScope(scope, async (tx) => {
            const before = await this.readOrNull(tx, id);
            if (!before)
                return null;
            await this.upsertSystemDescription(tx, scope.companyId, id, input);
            return { before, after: await this.read(tx, id) };
        });
    }
    remove(scope, id) {
        return this.prisma.withScope(scope, async (tx) => {
            const before = await this.readOrNull(tx, id);
            if (!before)
                return null;
            const history = (await tx.evaluation.count({ where: { serviceId: id } })) +
                (await tx.evidenceSubmission.count({
                    where: { evidenceRequirement: { clientControl: { serviceId: id } } },
                })) +
                (await tx.actionPlan.count({ where: { clientControl: { serviceId: id } } }));
            if (history > 0)
                throw new domain_error_1.DomainError('SERVICE_HAS_EVALUATIONS');
            const clientControls = { clientControl: { serviceId: id } };
            await tx.clientCauseControl.deleteMany({ where: clientControls });
            await tx.clientRiskCause.deleteMany({ where: { clientRisk: { serviceId: id } } });
            await tx.evidenceRequirement.deleteMany({ where: clientControls });
            await tx.clientControlTest.deleteMany({ where: clientControls });
            await tx.clientControlDimension.deleteMany({ where: clientControls });
            await tx.userControlAssignment.deleteMany({ where: clientControls });
            await tx.clientControl.deleteMany({ where: { serviceId: id } });
            await tx.clientCause.deleteMany({ where: { serviceId: id } });
            await tx.clientRisk.deleteMany({ where: { serviceId: id } });
            await tx.serviceAsset.deleteMany({ where: { serviceId: id } });
            await tx.scope.deleteMany({ where: { serviceId: id } });
            await tx.csoc.deleteMany({ where: { subserviceOrganization: { serviceId: id } } });
            await tx.cuec.deleteMany({ where: { serviceId: id } });
            await tx.subserviceOrganization.deleteMany({ where: { serviceId: id } });
            await tx.systemDescription.deleteMany({ where: { serviceId: id } });
            await tx.serviceRegulation.deleteMany({ where: { serviceId: id } });
            await tx.serviceFramework.deleteMany({ where: { serviceId: id } });
            await tx.serviceTrustCriterion.deleteMany({ where: { serviceId: id } });
            await tx.service.delete({ where: { id } });
            return before;
        }, CLONING_TRANSACTION);
    }
    async assertNameFree(tx, organizationId, name, exceptId) {
        const clash = await tx.service.findFirst({
            where: {
                organizationId,
                name: { equals: name, mode: 'insensitive' },
                ...(exceptId ? { id: { not: exceptId } } : {}),
            },
            select: { id: true },
        });
        if (clash)
            throw new domain_error_1.DomainError('SERVICE_NAME_TAKEN');
    }
    async replaceTrustCriteria(tx, tenantId, serviceId, criteria) {
        const wanted = await tx.trustCriterion.findMany({
            where: { criterion: { in: criteria } },
            select: { id: true },
        });
        const wantedIds = wanted.map((c) => c.id);
        await tx.serviceTrustCriterion.deleteMany({
            where: { serviceId, trustCriterionId: { notIn: wantedIds } },
        });
        const kept = await tx.serviceTrustCriterion.findMany({
            where: { serviceId },
            select: { trustCriterionId: true },
        });
        const keptIds = new Set(kept.map((c) => c.trustCriterionId));
        const toAdd = wantedIds.filter((id) => !keptIds.has(id));
        if (toAdd.length) {
            await tx.serviceTrustCriterion.createMany({
                data: toAdd.map((trustCriterionId) => ({ tenantId, serviceId, trustCriterionId })),
            });
        }
    }
    async replaceRegulations(tx, tenantId, serviceId, codes) {
        const wanted = await tx.regulation.findMany({
            where: { code: { in: codes } },
            select: { id: true },
        });
        const wantedIds = wanted.map((r) => r.id);
        await tx.serviceRegulation.deleteMany({
            where: { serviceId, regulationId: { notIn: wantedIds } },
        });
        const kept = await tx.serviceRegulation.findMany({
            where: { serviceId },
            select: { regulationId: true },
        });
        const keptIds = new Set(kept.map((r) => r.regulationId));
        const toAdd = wantedIds.filter((id) => !keptIds.has(id));
        if (toAdd.length) {
            await tx.serviceRegulation.createMany({
                data: toAdd.map((regulationId) => ({ tenantId, serviceId, regulationId })),
            });
        }
    }
    async syncSubservices(tx, tenantId, serviceId, wanted) {
        const current = await tx.subserviceOrganization.findMany({ where: { serviceId } });
        const pending = new Map();
        for (const s of wanted)
            pending.set(subserviceKey(s), (pending.get(subserviceKey(s)) ?? 0) + 1);
        const toDelete = [];
        for (const row of current) {
            const key = subserviceKey({
                type: row.type,
                provider: row.provider,
                serviceProvided: row.serviceProvided,
                responsibility: row.responsibility,
            });
            const left = pending.get(key) ?? 0;
            if (left > 0)
                pending.set(key, left - 1);
            else
                toDelete.push(row.id);
        }
        if (toDelete.length) {
            await tx.subserviceOrganization.deleteMany({ where: { id: { in: toDelete } } });
        }
        const toCreate = wanted.filter((s) => {
            const left = pending.get(subserviceKey(s)) ?? 0;
            if (left <= 0)
                return false;
            pending.set(subserviceKey(s), left - 1);
            return true;
        });
        if (toCreate.length) {
            await tx.subserviceOrganization.createMany({
                data: toCreate.map((s) => ({
                    tenantId,
                    serviceId,
                    type: s.type,
                    provider: s.provider,
                    serviceProvided: s.serviceProvided,
                    responsibility: s.responsibility,
                })),
            });
        }
    }
    async upsertSystemDescription(tx, tenantId, serviceId, input) {
        await tx.systemDescription.upsert({
            where: { serviceId },
            create: { tenantId, serviceId, filePath: input.url, sections: [] },
            update: { filePath: input.url, sections: [] },
        });
    }
    async syncFrameworks(tx, tenantId, serviceId, codes) {
        const current = await tx.serviceFramework.findMany({
            where: { serviceId },
            include: { framework: { select: { code: true } } },
        });
        const currentByCode = new Map(current.map((f) => [f.framework.code, f]));
        for (const row of current) {
            if (!codes.includes(row.framework.code) && row.status === 'active') {
                await tx.serviceFramework.update({ where: { id: row.id }, data: { status: 'paused' } });
            }
        }
        const today = new Date();
        for (const code of codes) {
            const existing = currentByCode.get(code);
            if (existing) {
                if (existing.status !== 'active') {
                    await tx.serviceFramework.update({ where: { id: existing.id }, data: { status: 'active' } });
                }
                continue;
            }
            const framework = await tx.framework.findFirstOrThrow({
                where: { code },
                orderBy: { version: 'desc' },
                select: { id: true },
            });
            const version = await tx.catalogVersion.findFirstOrThrow({
                orderBy: { number: 'desc' },
                select: { id: true },
            });
            await tx.serviceFramework.create({
                data: {
                    tenantId,
                    serviceId,
                    frameworkId: framework.id,
                    catalogVersionId: version.id,
                    contractedAt: startOfDayUtc(today),
                    evaluationPeriod: evaluationPeriodFor(today),
                },
            });
        }
    }
    async cloneContractedFrameworks(tx, tenantId, serviceId) {
        const [frameworks, criteria] = await Promise.all([
            tx.serviceFramework.findMany({ where: { serviceId, status: 'active' } }),
            tx.serviceTrustCriterion.findMany({ where: { serviceId }, select: { trustCriterionId: true } }),
        ]);
        for (const f of frameworks) {
            await this.cloner.cloneFramework(tx, {
                tenantId,
                serviceId,
                frameworkId: f.frameworkId,
                trustCriterionIds: criteria.map((c) => c.trustCriterionId),
                evaluationPeriod: f.evaluationPeriod,
            });
        }
    }
    async read(tx, id) {
        const detail = await this.readOrNull(tx, id);
        if (!detail)
            throw new domain_error_1.DomainError('NOT_FOUND');
        return detail;
    }
    async readOrNull(tx, id) {
        const row = await tx.service.findUnique({
            where: { id },
            include: {
                trustCriteria: { include: { trustCriterion: true } },
                regulations: { include: { regulation: true } },
                frameworks: { include: { framework: true, catalogVersion: true } },
                subserviceOrganizations: true,
                systemDescription: true,
                scope: { select: { id: true } },
            },
        });
        if (!row)
            return null;
        const criterionIds = row.trustCriteria.map((c) => c.trustCriterionId);
        const activeFrameworkIds = row.frameworks.filter((f) => f.status === 'active').map((f) => f.frameworkId);
        const [applicableRequirements, clonedControls] = await Promise.all([
            tx.requirement.count({
                where: { frameworkId: { in: activeFrameworkIds }, trustCriterionId: { in: criterionIds } },
            }),
            tx.clientControl.count({ where: { serviceId: id, isActive: true } }),
        ]);
        const data = {
            id: row.id,
            organizationId: row.organizationId,
            name: row.name,
            description: row.description,
            scopeStatement: row.scopeStatement,
            type: row.type,
            industriesServed: row.industriesServed,
            activeClientCount: row.activeClientCount,
            countries: row.countries,
            dataTypes: row.dataTypes,
            trustCriteria: row.trustCriteria
                .map((c) => c.trustCriterion.criterion)
                .sort((a, b) => a.localeCompare(b)),
            subserviceOrganizations: row.subserviceOrganizations.map((s) => ({
                id: s.id,
                type: s.type,
                provider: s.provider,
                serviceProvided: s.serviceProvided,
                responsibility: s.responsibility,
            })),
            frameworks: row.frameworks
                .map((f) => ({
                code: f.framework.code,
                name: f.framework.name,
                contractedAt: f.contractedAt.toISOString().slice(0, 10),
                status: f.status,
                catalogVersion: f.catalogVersion.number,
                evaluationPeriod: f.evaluationPeriod,
            }))
                .sort((a, b) => a.code.localeCompare(b.code)),
            regulations: row.regulations
                .map((r) => ({
                code: r.regulation.code,
                name: r.regulation.name,
                jurisdiction: r.regulation.jurisdiction,
            }))
                .sort((a, b) => a.code.localeCompare(b.code)),
            previousCertification: row.previousCertification,
            expectedAvailability: fromDbAvailability(row.expectedAvailability),
            systemDescription: row.systemDescription
                ? {
                    id: row.systemDescription.id,
                    kind: /^https?:\/\//i.test(row.systemDescription.filePath) ? 'link' : 'file',
                    url: row.systemDescription.filePath,
                    sections: Array.isArray(row.systemDescription.sections) ? row.systemDescription.sections : [],
                }
                : null,
            catalog: { status: 'ready', applicableRequirements, clonedControls },
            deploymentScenario: row.deploymentScenario,
            hasScope: row.scope !== null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
        return new service_entity_1.ServiceDetail(data);
    }
};
exports.ServicePrismaRepository = ServicePrismaRepository;
exports.ServicePrismaRepository = ServicePrismaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicePrismaRepository);
//# sourceMappingURL=service.prisma.repository.js.map