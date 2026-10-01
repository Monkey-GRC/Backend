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
exports.CompanyPrismaRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const access_key_entity_1 = require("../../domain/entities/access-key.entity");
const company_entity_1 = require("../../domain/entities/company.entity");
const company_repository_1 = require("../../domain/repositories/company.repository");
const toCompany = (r) => new company_entity_1.Company(r.id, r.name, r.adminEmail, r.isolationStrategy, r.status, r.createdAt, r.updatedAt);
const toAccessKey = (r) => new access_key_entity_1.AccessKey(r.id, r.companyId, r.status, r.expiresAt, r.usedAt);
const CURRENT_KEY_ORDER = { expiresAt: 'desc' };
let CompanyPrismaRepository = class CompanyPrismaRepository extends company_repository_1.CompanyRepository {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    existsActiveWithName(scope, name) {
        return this.prisma.withScope(scope, async (tx) => (await tx.company.count({
            where: { status: 'active', name: { equals: name, mode: 'insensitive' } },
        })) > 0);
    }
    existsWithAdminEmail(scope, adminEmail) {
        return this.prisma.withScope(scope, async (tx) => (await tx.company.count({
            where: { adminEmail: { equals: adminEmail, mode: 'insensitive' } },
        })) > 0);
    }
    createWithAccessKey(scope, data, key) {
        return this.prisma.withScope(scope, async (tx) => {
            const company = await tx.company.create({
                data: {
                    name: data.name,
                    adminEmail: data.adminEmail,
                    isolationStrategy: data.isolationStrategy,
                },
            });
            const accessKey = await tx.accessKey.create({
                data: {
                    companyId: company.id,
                    createdBy: key.createdBy,
                    codeHash: key.codeHash,
                    expiresAt: key.expiresAt,
                },
            });
            return { company: toCompany(company), accessKey: toAccessKey(accessKey) };
        });
    }
    list(scope, query) {
        return this.prisma.withScope(scope, async (tx) => {
            const where = {
                id: { not: query.excludeCompanyId },
                ...(query.status ? { status: query.status } : {}),
            };
            const field = query.sort.replace('-', '') === 'name' ? 'name' : 'createdAt';
            const direction = query.sort.startsWith('-') ? 'desc' : 'asc';
            const [rows, total] = await Promise.all([
                tx.company.findMany({
                    where,
                    orderBy: { [field]: direction },
                    skip: (query.page - 1) * query.pageSize,
                    take: query.pageSize,
                    include: { accessKeys: { orderBy: CURRENT_KEY_ORDER, take: 1 } },
                }),
                tx.company.count({ where }),
            ]);
            const onboarded = await this.onboardedCompanyIds(tx, scope, rows.map((r) => r.id));
            return {
                items: rows.map((row) => ({
                    company: toCompany(row),
                    currentAccessKey: row.accessKeys[0] ? toAccessKey(row.accessKeys[0]) : null,
                    onboardingCompleted: onboarded.has(row.id),
                })),
                total,
                page: query.page,
                pageSize: query.pageSize,
            };
        });
    }
    findById(scope, companyId, excludeCompanyId) {
        if (companyId === excludeCompanyId)
            return Promise.resolve(null);
        return this.prisma.withScope(scope, async (tx) => {
            const row = await tx.company.findUnique({
                where: { id: companyId },
                include: { accessKeys: { orderBy: CURRENT_KEY_ORDER } },
            });
            if (!row)
                return null;
            const onboarded = await this.onboardedCompanyIds(tx, scope, [row.id]);
            const accessKeys = row.accessKeys.map(toAccessKey);
            return {
                company: toCompany(row),
                currentAccessKey: accessKeys[0] ?? null,
                onboardingCompleted: onboarded.has(row.id),
                accessKeys,
            };
        });
    }
    async onboardedCompanyIds(tx, scope, companyIds) {
        const onboarded = new Set();
        for (const id of companyIds) {
            await tx.$queryRaw `SELECT set_config('app.tenant_id', ${id}, true)`;
            const organization = await tx.organization.findUnique({
                where: { companyId: id },
                select: { id: true },
            });
            if (organization)
                onboarded.add(id);
        }
        await tx.$queryRaw `SELECT set_config('app.tenant_id', ${scope.companyId}, true)`;
        return onboarded;
    }
};
exports.CompanyPrismaRepository = CompanyPrismaRepository;
exports.CompanyPrismaRepository = CompanyPrismaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyPrismaRepository);
//# sourceMappingURL=company.prisma.repository.js.map