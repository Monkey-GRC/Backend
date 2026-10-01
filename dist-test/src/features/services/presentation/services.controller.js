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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_i18n_1 = require("nestjs-i18n");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const response_dto_1 = require("../../../common/dtos/response.dto");
const page_1 = require("../../../common/pagination/page");
const create_service_dto_1 = require("../application/dtos/create-service.dto");
const list_services_query_1 = require("../application/dtos/list-services.query");
const system_description_dto_1 = require("../application/dtos/system-description.dto");
const update_service_dto_1 = require("../application/dtos/update-service.dto");
const create_service_use_case_1 = require("../application/use-cases/create-service.use-case");
const delete_service_use_case_1 = require("../application/use-cases/delete-service.use-case");
const get_service_use_case_1 = require("../application/use-cases/get-service.use-case");
const list_services_use_case_1 = require("../application/use-cases/list-services.use-case");
const set_system_description_use_case_1 = require("../application/use-cases/set-system-description.use-case");
const update_service_use_case_1 = require("../application/use-cases/update-service.use-case");
const service_response_mapper_1 = require("./service-response.mapper");
const t = (key) => nestjs_i18n_1.I18nContext.current()?.t(key) ?? key;
const metaOf = (req) => ({
    ipAddress: req.ip ?? '',
    userAgent: req.get('user-agent') ?? '',
});
const idPipe = new common_1.ParseUUIDPipe({ errorHttpStatusCode: common_1.HttpStatus.NOT_FOUND });
const toInput = (dto) => ({
    name: dto.name,
    description: dto.description,
    scopeStatement: dto.scope_statement,
    type: dto.type,
    industriesServed: dto.industries_served,
    activeClientCount: dto.active_client_count ?? null,
    countries: dto.countries,
    dataTypes: dto.data_types,
    trustCriteria: dto.trust_criteria,
    subserviceOrganizations: dto.subservice_organizations.map((s) => ({
        type: s.type,
        provider: s.provider ?? null,
        serviceProvided: s.service_provided ?? null,
        responsibility: s.responsibility ?? null,
    })),
    frameworkCodes: dto.framework_codes,
    regulationCodes: dto.regulation_codes,
    previousCertification: dto.previous_certification ?? null,
    expectedAvailability: dto.expected_availability,
    systemDescription: { kind: 'link', url: dto.system_description.url },
});
const toPatch = (dto) => {
    const patch = {};
    if (dto.name !== undefined)
        patch.name = dto.name;
    if (dto.description !== undefined)
        patch.description = dto.description;
    if (dto.scope_statement !== undefined)
        patch.scopeStatement = dto.scope_statement;
    if (dto.type !== undefined)
        patch.type = dto.type;
    if (dto.industries_served !== undefined)
        patch.industriesServed = dto.industries_served;
    if (dto.active_client_count !== undefined)
        patch.activeClientCount = dto.active_client_count;
    if (dto.countries !== undefined)
        patch.countries = dto.countries;
    if (dto.data_types !== undefined)
        patch.dataTypes = dto.data_types;
    if (dto.trust_criteria !== undefined)
        patch.trustCriteria = dto.trust_criteria;
    if (dto.subservice_organizations !== undefined) {
        patch.subserviceOrganizations = dto.subservice_organizations.map((s) => ({
            type: s.type,
            provider: s.provider ?? null,
            serviceProvided: s.service_provided ?? null,
            responsibility: s.responsibility ?? null,
        }));
    }
    if (dto.framework_codes !== undefined)
        patch.frameworkCodes = dto.framework_codes;
    if (dto.regulation_codes !== undefined)
        patch.regulationCodes = dto.regulation_codes;
    if (dto.previous_certification !== undefined)
        patch.previousCertification = dto.previous_certification;
    if (dto.expected_availability !== undefined)
        patch.expectedAvailability = dto.expected_availability;
    if (dto.system_description !== undefined) {
        patch.systemDescription = { kind: 'link', url: dto.system_description.url };
    }
    return patch;
};
let ServicesController = class ServicesController {
    createService;
    listServices;
    getService;
    updateService;
    deleteService;
    setSystemDescription;
    constructor(createService, listServices, getService, updateService, deleteService, setSystemDescription) {
        this.createService = createService;
        this.listServices = listServices;
        this.getService = getService;
        this.updateService = updateService;
        this.deleteService = deleteService;
        this.setSystemDescription = setSystemDescription;
    }
    async create(principal, dto, req) {
        const service = await this.createService.execute(principal, toInput(dto), metaOf(req));
        return new response_dto_1.ResponseDto(common_1.HttpStatus.CREATED, t('service.created'), (0, service_response_mapper_1.toServiceResponse)(service));
    }
    async list(principal, query) {
        const page = await this.listServices.execute(principal, {
            page: query.page,
            pageSize: query.page_size,
        });
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('service.list'), (0, page_1.toPageResponse)(page, service_response_mapper_1.toServiceListItem));
    }
    async detail(principal, id) {
        const service = await this.getService.execute(principal, id);
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('service.detail'), (0, service_response_mapper_1.toServiceResponse)(service));
    }
    async update(principal, id, dto, req) {
        const service = await this.updateService.execute(principal, id, toPatch(dto), metaOf(req));
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('service.updated'), (0, service_response_mapper_1.toServiceResponse)(service));
    }
    async remove(principal, id, req) {
        await this.deleteService.execute(principal, id, metaOf(req));
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('service.deleted'), null);
    }
    async saveSystemDescription(principal, id, dto, req) {
        const service = await this.setSystemDescription.execute(principal, id, { kind: 'link', url: dto.url }, metaOf(req));
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('service.system_description_saved'), (0, service_response_mapper_1.toServiceResponse)(service));
    }
};
exports.ServicesController = ServicesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_service_dto_1.CreateServiceDto, Object]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_services_query_1.ListServicesQuery]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "detail", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_service_dto_1.UpdateServiceDto, Object]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/system-description'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, system_description_dto_1.SetSystemDescriptionDto, Object]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "saveSystemDescription", null);
exports.ServicesController = ServicesController = __decorate([
    (0, swagger_1.ApiTags)('services'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, roles_decorator_1.Roles)('admin_empresa'),
    (0, common_1.Controller)('services'),
    __metadata("design:paramtypes", [create_service_use_case_1.CreateServiceUseCase,
        list_services_use_case_1.ListServicesUseCase,
        get_service_use_case_1.GetServiceUseCase,
        update_service_use_case_1.UpdateServiceUseCase,
        delete_service_use_case_1.DeleteServiceUseCase,
        set_system_description_use_case_1.SetSystemDescriptionUseCase])
], ServicesController);
//# sourceMappingURL=services.controller.js.map