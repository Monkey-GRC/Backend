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
exports.OrganizationalContextPrismaRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const organizational_context_entity_1 = require("../../domain/entities/organizational-context.entity");
const organizational_context_repository_1 = require("../../domain/repositories/organizational-context.repository");
let OrganizationalContextPrismaRepository = class OrganizationalContextPrismaRepository extends organizational_context_repository_1.OrganizationalContextRepository {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    find(scope) {
        return this.prisma.withScope(scope, (tx) => this.read(tx, scope.companyId));
    }
    async existingRegulationCodes(codes) {
        const rows = await this.prisma.regulation.findMany({
            where: { code: { in: codes } },
            select: { code: true },
        });
        return rows.map((r) => r.code);
    }
    save(scope, input) {
        return this.prisma.withScope(scope, async (tx) => {
            const before = await this.read(tx, scope.companyId);
            const company = await tx.company.findUniqueOrThrow({
                where: { id: scope.companyId },
                select: { name: true },
            });
            const fields = {
                description: input.description,
                size: input.size,
                industry: input.industry,
                businessModel: input.businessModel,
                yearsInOperation: input.yearsInOperation,
                incorporationCountries: input.incorporationCountries,
                clientCountries: input.clientCountries,
                complianceMaturity: input.complianceMaturity,
            };
            const organization = await tx.organization.upsert({
                where: { companyId: scope.companyId },
                create: { companyId: scope.companyId, name: company.name, ...fields },
                update: fields,
                select: { id: true },
            });
            const wanted = await tx.regulation.findMany({
                where: { code: { in: input.regulationCodes } },
                select: { id: true },
            });
            const wantedIds = wanted.map((r) => r.id);
            await tx.organizationRegulation.deleteMany({
                where: { organizationId: organization.id, regulationId: { notIn: wantedIds } },
            });
            const kept = await tx.organizationRegulation.findMany({
                where: { organizationId: organization.id },
                select: { regulationId: true },
            });
            const keptIds = new Set(kept.map((r) => r.regulationId));
            const toAdd = wantedIds.filter((id) => !keptIds.has(id));
            if (toAdd.length > 0) {
                await tx.organizationRegulation.createMany({
                    data: toAdd.map((regulationId) => ({
                        tenantId: scope.companyId,
                        organizationId: organization.id,
                        regulationId,
                    })),
                });
            }
            return { before, after: await this.read(tx, scope.companyId) };
        });
    }
    async read(tx, companyId) {
        const company = await tx.company.findUniqueOrThrow({
            where: { id: companyId },
            select: { name: true },
        });
        const org = await tx.organization.findUnique({
            where: { companyId },
            include: { regulations: { include: { regulation: true } } },
        });
        if (!org)
            return organizational_context_entity_1.OrganizationalContext.empty(company.name);
        return new organizational_context_entity_1.OrganizationalContext(org.id, org.name, org.description, org.size, org.industry, org.businessModel, org.yearsInOperation, org.incorporationCountries, org.clientCountries, org.complianceMaturity, org.regulations
            .map((r) => ({
            code: r.regulation.code,
            name: r.regulation.name,
            jurisdiction: r.regulation.jurisdiction,
        }))
            .sort((a, b) => a.code.localeCompare(b.code)));
    }
};
exports.OrganizationalContextPrismaRepository = OrganizationalContextPrismaRepository;
exports.OrganizationalContextPrismaRepository = OrganizationalContextPrismaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationalContextPrismaRepository);
//# sourceMappingURL=organizational-context.prisma.repository.js.map