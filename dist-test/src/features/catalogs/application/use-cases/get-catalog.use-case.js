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
exports.GetCatalogUseCase = void 0;
const common_1 = require("@nestjs/common");
const onboarding_catalogs_1 = require("../../../../common/catalogs/onboarding-catalogs");
const domain_error_1 = require("../../../../common/errors/domain-error");
const capability_catalog_repository_1 = require("../../domain/repositories/capability-catalog.repository");
const framework_catalog_repository_1 = require("../../domain/repositories/framework-catalog.repository");
const regulation_catalog_repository_1 = require("../../domain/repositories/regulation-catalog.repository");
let GetCatalogUseCase = class GetCatalogUseCase {
    regulations;
    frameworks;
    capabilities;
    constructor(regulations, frameworks, capabilities) {
        this.regulations = regulations;
        this.frameworks = frameworks;
        this.capabilities = capabilities;
    }
    async execute(name) {
        if (name === 'automated-capabilities') {
            return { kind: 'capabilities', items: await this.capabilities.findAll() };
        }
        if (name === 'regulations') {
            return { kind: 'regulations', items: await this.regulations.findAll() };
        }
        if (name === 'frameworks') {
            return { kind: 'frameworks', items: await this.frameworks.findAll() };
        }
        if (!Object.prototype.hasOwnProperty.call(onboarding_catalogs_1.ENUM_CATALOGS, name)) {
            throw new domain_error_1.DomainError('NOT_FOUND');
        }
        return { kind: 'enum', name, values: onboarding_catalogs_1.ENUM_CATALOGS[name] };
    }
};
exports.GetCatalogUseCase = GetCatalogUseCase;
exports.GetCatalogUseCase = GetCatalogUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [regulation_catalog_repository_1.RegulationCatalogRepository,
        framework_catalog_repository_1.FrameworkCatalogRepository,
        capability_catalog_repository_1.CapabilityCatalogRepository])
], GetCatalogUseCase);
//# sourceMappingURL=get-catalog.use-case.js.map