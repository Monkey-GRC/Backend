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
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_i18n_1 = require("nestjs-i18n");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const response_dto_1 = require("../../../common/dtos/response.dto");
const page_1 = require("../../../common/pagination/page");
const create_company_dto_1 = require("../application/dtos/create-company.dto");
const list_companies_query_1 = require("../application/dtos/list-companies.query");
const get_company_use_case_1 = require("../application/use-cases/get-company.use-case");
const list_companies_use_case_1 = require("../application/use-cases/list-companies.use-case");
const register_company_use_case_1 = require("../application/use-cases/register-company.use-case");
const company_response_mapper_1 = require("./company-response.mapper");
const t = (key) => nestjs_i18n_1.I18nContext.current()?.t(key) ?? key;
let CompaniesController = class CompaniesController {
    registerCompany;
    listCompanies;
    getCompany;
    constructor(registerCompany, listCompanies, getCompany) {
        this.registerCompany = registerCompany;
        this.listCompanies = listCompanies;
        this.getCompany = getCompany;
    }
    async create(principal, dto, req) {
        const result = await this.registerCompany.execute(principal, {
            name: dto.name,
            requiresDedicatedDatabase: dto.requires_dedicated_database,
            adminEmail: dto.admin_email,
        }, { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
        return new response_dto_1.ResponseDto(common_1.HttpStatus.CREATED, t('company.created'), (0, company_response_mapper_1.toRegisteredCompanyResponse)(result));
    }
    async list(principal, query) {
        const page = await this.listCompanies.execute(principal, {
            page: query.page,
            pageSize: query.page_size,
            sort: query.sort,
            status: query.status,
        });
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('company.list'), (0, page_1.toPageResponse)(page, (item) => (0, company_response_mapper_1.toCompanyListItem)(item)));
    }
    async detail(principal, id) {
        const detail = await this.getCompany.execute(principal, id);
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('company.detail'), (0, company_response_mapper_1.toCompanyDetail)(detail));
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_company_dto_1.CreateCompanyDto, Object]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_companies_query_1.ListCompaniesQuery]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ errorHttpStatusCode: common_1.HttpStatus.NOT_FOUND }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "detail", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, swagger_1.ApiTags)('companies'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, roles_decorator_1.Roles)('admin_monkey'),
    (0, common_1.Controller)('companies'),
    __metadata("design:paramtypes", [register_company_use_case_1.RegisterCompanyUseCase,
        list_companies_use_case_1.ListCompaniesUseCase,
        get_company_use_case_1.GetCompanyUseCase])
], CompaniesController);
//# sourceMappingURL=companies.controller.js.map