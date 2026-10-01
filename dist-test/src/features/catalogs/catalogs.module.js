"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogsModule = void 0;
const common_1 = require("@nestjs/common");
const capability_catalog_repository_1 = require("./domain/repositories/capability-catalog.repository");
const framework_catalog_repository_1 = require("./domain/repositories/framework-catalog.repository");
const capability_catalog_prisma_repository_1 = require("./infrastructure/repositories/capability-catalog.prisma.repository");
const regulation_catalog_repository_1 = require("./domain/repositories/regulation-catalog.repository");
const get_catalog_use_case_1 = require("./application/use-cases/get-catalog.use-case");
const framework_catalog_prisma_repository_1 = require("./infrastructure/repositories/framework-catalog.prisma.repository");
const regulation_catalog_prisma_repository_1 = require("./infrastructure/repositories/regulation-catalog.prisma.repository");
const catalogs_controller_1 = require("./presentation/catalogs.controller");
let CatalogsModule = class CatalogsModule {
};
exports.CatalogsModule = CatalogsModule;
exports.CatalogsModule = CatalogsModule = __decorate([
    (0, common_1.Module)({
        controllers: [catalogs_controller_1.CatalogsController],
        providers: [
            { provide: regulation_catalog_repository_1.RegulationCatalogRepository, useClass: regulation_catalog_prisma_repository_1.RegulationCatalogPrismaRepository },
            { provide: framework_catalog_repository_1.FrameworkCatalogRepository, useClass: framework_catalog_prisma_repository_1.FrameworkCatalogPrismaRepository },
            { provide: capability_catalog_repository_1.CapabilityCatalogRepository, useClass: capability_catalog_prisma_repository_1.CapabilityCatalogPrismaRepository },
            get_catalog_use_case_1.GetCatalogUseCase,
        ],
    })
], CatalogsModule);
//# sourceMappingURL=catalogs.module.js.map