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
exports.RegulationCatalogPrismaRepository = void 0;
const common_1 = require("@nestjs/common");
const onboarding_catalogs_1 = require("../../../../common/catalogs/onboarding-catalogs");
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const regulation_catalog_repository_1 = require("../../domain/repositories/regulation-catalog.repository");
let RegulationCatalogPrismaRepository = class RegulationCatalogPrismaRepository extends regulation_catalog_repository_1.RegulationCatalogRepository {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async findAll() {
        const rows = await this.prisma.regulation.findMany({
            select: { code: true, name: true, jurisdiction: true },
        });
        const order = new Map(onboarding_catalogs_1.REGULATION_CODES.map((c, i) => [c, i]));
        return rows.sort((a, b) => (order.get(a.code) ?? 99) - (order.get(b.code) ?? 99));
    }
};
exports.RegulationCatalogPrismaRepository = RegulationCatalogPrismaRepository;
exports.RegulationCatalogPrismaRepository = RegulationCatalogPrismaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegulationCatalogPrismaRepository);
//# sourceMappingURL=regulation-catalog.prisma.repository.js.map