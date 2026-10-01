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
exports.TechnicalControlController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_i18n_1 = require("nestjs-i18n");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const response_dto_1 = require("../../../common/dtos/response.dto");
const technical_control_dtos_1 = require("../application/dtos/technical-control.dtos");
const service_technical_control_use_cases_1 = require("../application/use-cases/service-technical-control.use-cases");
const connection_probe_1 = require("../domain/ports/connection-probe");
const technical_control_response_mapper_1 = require("./technical-control-response.mapper");
const t = (key) => nestjs_i18n_1.I18nContext.current()?.t(key) ?? key;
const metaOf = (req) => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
const idPipe = new common_1.ParseUUIDPipe({ errorHttpStatusCode: common_1.HttpStatus.NOT_FOUND });
let TechnicalControlController = class TechnicalControlController {
    getState;
    setScenario;
    setScope;
    probe;
    constructor(getState, setScenario, setScope, probe) {
        this.getState = getState;
        this.setScenario = setScenario;
        this.setScope = setScope;
        this.probe = probe;
    }
    async state(principal, id) {
        const state = await this.getState.execute(principal, id);
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('technical_control.state'), (0, technical_control_response_mapper_1.toTechnicalControlResponse)(state, this.probe.mode));
    }
    async deploymentScenario(principal, id, dto, req) {
        const state = await this.setScenario.execute(principal, id, dto.deployment_scenario, metaOf(req));
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('deployment_scenario.saved'), (0, technical_control_response_mapper_1.toDeploymentScenarioResponse)(state));
    }
    async scope(principal, id, dto, req) {
        const state = await this.setScope.execute(principal, id, {
            server_count: dto.server_count,
            cloud_count: dto.cloud_count,
            app_count: dto.app_count,
            database_count: dto.database_count,
            endpoint_count: dto.endpoint_count,
        }, metaOf(req));
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('scope.saved'), (0, technical_control_response_mapper_1.toScopeResponse)(state.scope));
    }
};
exports.TechnicalControlController = TechnicalControlController;
__decorate([
    (0, common_1.Get)('technical-control'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TechnicalControlController.prototype, "state", null);
__decorate([
    (0, common_1.Put)('deployment-scenario'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, technical_control_dtos_1.DeploymentScenarioDto, Object]),
    __metadata("design:returntype", Promise)
], TechnicalControlController.prototype, "deploymentScenario", null);
__decorate([
    (0, common_1.Put)('scope'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, technical_control_dtos_1.ScopeDto, Object]),
    __metadata("design:returntype", Promise)
], TechnicalControlController.prototype, "scope", null);
exports.TechnicalControlController = TechnicalControlController = __decorate([
    (0, swagger_1.ApiTags)('technical-control'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, roles_decorator_1.Roles)('admin_empresa'),
    (0, common_1.Controller)('services/:id'),
    __metadata("design:paramtypes", [service_technical_control_use_cases_1.GetTechnicalControlUseCase,
        service_technical_control_use_cases_1.SetDeploymentScenarioUseCase,
        service_technical_control_use_cases_1.SetScopeUseCase,
        connection_probe_1.ConnectionProbe])
], TechnicalControlController);
//# sourceMappingURL=technical-control.controller.js.map