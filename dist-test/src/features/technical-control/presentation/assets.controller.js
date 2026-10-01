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
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_i18n_1 = require("nestjs-i18n");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const response_dto_1 = require("../../../common/dtos/response.dto");
const page_1 = require("../../../common/pagination/page");
const technical_control_dtos_1 = require("../application/dtos/technical-control.dtos");
const asset_use_cases_1 = require("../application/use-cases/asset.use-cases");
const connection_probe_1 = require("../domain/ports/connection-probe");
const technical_control_response_mapper_1 = require("./technical-control-response.mapper");
const t = (key) => nestjs_i18n_1.I18nContext.current()?.t(key) ?? key;
const metaOf = (req) => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
const idPipe = new common_1.ParseUUIDPipe({ errorHttpStatusCode: common_1.HttpStatus.NOT_FOUND });
let AssetsController = class AssetsController {
    createAsset;
    listAssets;
    getAsset;
    validateAsset;
    activateAsset;
    scheduleAsset;
    probe;
    constructor(createAsset, listAssets, getAsset, validateAsset, activateAsset, scheduleAsset, probe) {
        this.createAsset = createAsset;
        this.listAssets = listAssets;
        this.getAsset = getAsset;
        this.validateAsset = validateAsset;
        this.activateAsset = activateAsset;
        this.scheduleAsset = scheduleAsset;
        this.probe = probe;
    }
    async create(principal, dto, req) {
        const asset = await this.createAsset.execute(principal, {
            name: dto.name,
            connectionCategory: dto.connection_category,
            platform: dto.platform,
            ipAddress: dto.ip_address ?? null,
            location: dto.location ?? null,
            criticality: dto.criticality,
            tags: dto.tags,
            serviceIds: dto.service_ids,
            responsibleId: dto.responsible_id ?? null,
            credentials: dto.credentials,
        }, metaOf(req));
        return new response_dto_1.ResponseDto(common_1.HttpStatus.CREATED, t('asset.created'), (0, technical_control_response_mapper_1.toAssetResponse)(asset));
    }
    async list(principal, query) {
        const page = await this.listAssets.execute(principal, {
            serviceId: query.service_id,
            connectionCategory: query.connection_category,
            operationalStatus: query.operational_status,
        }, { page: query.page, pageSize: query.page_size });
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('asset.list'), (0, page_1.toPageResponse)(page, technical_control_response_mapper_1.toAssetListItem));
    }
    async detail(principal, id) {
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('asset.detail'), (0, technical_control_response_mapper_1.toAssetResponse)(await this.getAsset.execute(principal, id)));
    }
    async validate(principal, id, req) {
        const { asset, checksAvailable } = await this.validateAsset.execute(principal, id, metaOf(req));
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('asset.validated'), {
            connection_status: asset.provisioning.connectionStatus,
            last_validated_at: asset.provisioning.lastValidatedAt?.toISOString() ?? null,
            technical_coverage: asset.technicalCoverage,
            checks_available: checksAvailable,
            mode: this.probe.mode === 'simulated' ? 'demo' : 'live',
        });
    }
    async activate(principal, id, req) {
        const asset = await this.activateAsset.execute(principal, id, metaOf(req));
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('asset.activated'), (0, technical_control_response_mapper_1.toAssetResponse)(asset));
    }
    async schedule(principal, id, dto, req) {
        const asset = await this.scheduleAsset.execute(principal, id, dto.frequency, metaOf(req));
        return new response_dto_1.ResponseDto(common_1.HttpStatus.OK, t('asset.scheduled'), (0, technical_control_response_mapper_1.toAssetResponse)(asset));
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, technical_control_dtos_1.CreateAssetDto, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, technical_control_dtos_1.ListAssetsQuery]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(':id/validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "activate", null);
__decorate([
    (0, common_1.Put)(':id/schedule'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', idPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, technical_control_dtos_1.ScheduleDto, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "schedule", null);
exports.AssetsController = AssetsController = __decorate([
    (0, swagger_1.ApiTags)('assets'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, roles_decorator_1.Roles)('admin_empresa'),
    (0, common_1.Controller)('assets'),
    __metadata("design:paramtypes", [asset_use_cases_1.CreateAssetUseCase,
        asset_use_cases_1.ListAssetsUseCase,
        asset_use_cases_1.GetAssetUseCase,
        asset_use_cases_1.ValidateAssetUseCase,
        asset_use_cases_1.ActivateAssetUseCase,
        asset_use_cases_1.ScheduleAssetUseCase,
        connection_probe_1.ConnectionProbe])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map