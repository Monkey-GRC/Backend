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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_i18n_1 = require("nestjs-i18n");
const service_catalogs_1 = require("../../../common/catalogs/service-catalogs");
const response_dto_1 = require("../../../common/dtos/response.dto");
const get_catalog_use_case_1 = require("../application/use-cases/get-catalog.use-case");
const t = (key) => nestjs_i18n_1.I18nContext.current()?.t(key) ?? key;
const countryGroup = (value) => value === 'eu' ? 'region' : value === 'other' ? 'other' : 'country';
const serviceCountryGroup = (value) => service_catalogs_1.SERVICE_COUNTRY_REGIONS.includes(value) ? 'region' : 'country';
function toItems(catalog) {
    if (catalog.kind === 'capabilities') {
        return catalog.items.map((c) => ({
            catalog_code: c.catalogCode,
            category: c.category,
            method: c.method,
            required_permissions: c.requiredPermissions,
            base_frequency: c.baseFrequency,
            supported_platforms: c.supportedPlatforms,
            generated_evidence: c.generatedEvidence,
        }));
    }
    if (catalog.kind === 'regulations') {
        return catalog.items.map((r) => ({
            code: r.code,
            name: r.name,
            jurisdiction: r.jurisdiction,
            label: r.code === 'none' || r.code === 'other' ? t(`catalogs.regulation.${r.code}`) : r.name,
        }));
    }
    if (catalog.kind === 'frameworks') {
        return catalog.items.map((f) => ({
            code: f.code,
            name: f.name,
            description: f.description,
            label: f.name,
        }));
    }
    const isCountry = catalog.name === 'incorporation_country' || catalog.name === 'client_country';
    const isServiceCountry = catalog.name === 'service_country';
    return catalog.values.map((value) => ({
        value,
        label: t(`catalogs.${isCountry ? 'country' : catalog.name}.${value}`),
        ...(isCountry ? { group: countryGroup(value) } : {}),
        ...(isServiceCountry ? { group: serviceCountryGroup(value) } : {}),
    }));
}
let CatalogsController = class CatalogsController {
    getCatalog;
    constructor(getCatalog) {
        this.getCatalog = getCatalog;
    }
    async get(name) {
        const catalog = await this.getCatalog.execute(name);
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('catalog.list'), { items: toItems(catalog) });
    }
};
exports.CatalogsController = CatalogsController;
__decorate([
    (0, common_1.Get)(':name'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "get", null);
exports.CatalogsController = CatalogsController = __decorate([
    (0, swagger_1.ApiTags)('catalogs'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Controller)('catalogs'),
    __metadata("design:paramtypes", [get_catalog_use_case_1.GetCatalogUseCase])
], CatalogsController);
//# sourceMappingURL=catalogs.controller.js.map