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
exports.OnboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_i18n_1 = require("nestjs-i18n");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const response_dto_1 = require("../../../common/dtos/response.dto");
const save_organizational_context_dto_1 = require("../application/dtos/save-organizational-context.dto");
const get_organizational_context_use_case_1 = require("../application/use-cases/get-organizational-context.use-case");
const save_organizational_context_use_case_1 = require("../application/use-cases/save-organizational-context.use-case");
const organizational_context_response_mapper_1 = require("./organizational-context-response.mapper");
const t = (key) => nestjs_i18n_1.I18nContext.current()?.t(key) ?? key;
let OnboardingController = class OnboardingController {
    getContext;
    saveContext;
    constructor(getContext, saveContext) {
        this.getContext = getContext;
        this.saveContext = saveContext;
    }
    async get(principal) {
        const ctx = await this.getContext.execute(principal);
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('organizational_context.get'), (0, organizational_context_response_mapper_1.toOrganizationalContextResponse)(ctx));
    }
    async save(principal, dto, req) {
        const ctx = await this.saveContext.execute(principal, {
            description: dto.description,
            size: dto.size,
            industry: dto.industry,
            businessModel: dto.business_model,
            yearsInOperation: dto.years_in_operation ?? null,
            incorporationCountries: dto.incorporation_countries,
            clientCountries: dto.client_countries,
            complianceMaturity: dto.compliance_maturity,
            regulationCodes: dto.regulation_codes,
        }, { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('organizational_context.saved'), (0, organizational_context_response_mapper_1.toOrganizationalContextResponse)(ctx));
    }
};
exports.OnboardingController = OnboardingController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, save_organizational_context_dto_1.SaveOrganizationalContextDto, Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "save", null);
exports.OnboardingController = OnboardingController = __decorate([
    (0, swagger_1.ApiTags)('onboarding'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, roles_decorator_1.Roles)('admin_empresa'),
    (0, common_1.Controller)('onboarding/organizational-context'),
    __metadata("design:paramtypes", [get_organizational_context_use_case_1.GetOrganizationalContextUseCase,
        save_organizational_context_use_case_1.SaveOrganizationalContextUseCase])
], OnboardingController);
//# sourceMappingURL=onboarding.controller.js.map