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
exports.CapabilityCatalogPrismaRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const capability_catalog_repository_1 = require("../../domain/repositories/capability-catalog.repository");
const asStrings = (value) => Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];
let CapabilityCatalogPrismaRepository = class CapabilityCatalogPrismaRepository extends capability_catalog_repository_1.CapabilityCatalogRepository {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async findAll() {
        const rows = await this.prisma.automatedCapability.findMany({
            select: {
                catalogCode: true,
                category: true,
                supportedPlatforms: true,
                method: true,
                requiredPermissions: true,
                baseFrequency: true,
                generatedEvidence: true,
            },
            orderBy: { catalogCode: 'asc' },
        });
        return rows.map((r) => ({
            ...r,
            supportedPlatforms: asStrings(r.supportedPlatforms),
            requiredPermissions: asStrings(r.requiredPermissions),
        }));
    }
};
exports.CapabilityCatalogPrismaRepository = CapabilityCatalogPrismaRepository;
exports.CapabilityCatalogPrismaRepository = CapabilityCatalogPrismaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CapabilityCatalogPrismaRepository);
//# sourceMappingURL=capability-catalog.prisma.repository.js.map