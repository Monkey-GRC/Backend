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
exports.ListAssetsQuery = exports.ScheduleDto = exports.CreateAssetDto = exports.ScopeDto = exports.DeploymentScenarioDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const technical_catalogs_1 = require("../../../../common/catalogs/technical-catalogs");
const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);
const trimOrNull = ({ value }) => typeof value === 'string' ? value.trim() || null : value;
class DeploymentScenarioDto {
    deployment_scenario;
}
exports.DeploymentScenarioDto = DeploymentScenarioDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: technical_catalogs_1.DEPLOYMENT_SCENARIO_VALUES }),
    (0, class_validator_1.IsIn)(technical_catalogs_1.DEPLOYMENT_SCENARIO_VALUES),
    __metadata("design:type", Object)
], DeploymentScenarioDto.prototype, "deployment_scenario", void 0);
class ScopeDto {
    server_count;
    cloud_count;
    app_count;
    database_count;
    endpoint_count;
}
exports.ScopeDto = ScopeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(technical_catalogs_1.SCOPE_MAX),
    __metadata("design:type", Number)
], ScopeDto.prototype, "server_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(technical_catalogs_1.SCOPE_MAX),
    __metadata("design:type", Number)
], ScopeDto.prototype, "cloud_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(technical_catalogs_1.SCOPE_MAX),
    __metadata("design:type", Number)
], ScopeDto.prototype, "app_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(technical_catalogs_1.SCOPE_MAX),
    __metadata("design:type", Number)
], ScopeDto.prototype, "database_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(technical_catalogs_1.SCOPE_MAX),
    __metadata("design:type", Number)
], ScopeDto.prototype, "endpoint_count", void 0);
class CreateAssetDto {
    name;
    connection_category;
    platform;
    ip_address;
    location;
    criticality;
    tags;
    service_ids;
    responsible_id;
    credentials;
}
exports.CreateAssetDto = CreateAssetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'srv-app-prod-01' }),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: technical_catalogs_1.CONNECTION_CATEGORY_VALUES }),
    (0, class_validator_1.IsIn)(technical_catalogs_1.CONNECTION_CATEGORY_VALUES),
    __metadata("design:type", Object)
], CreateAssetDto.prototype, "connection_category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Linux' }),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true, example: '10.20.3.14' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimOrNull),
    (0, class_validator_1.IsIP)(),
    __metadata("design:type", Object)
], CreateAssetDto.prototype, "ip_address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true, example: 'Azure East US' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimOrNull),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", Object)
], CreateAssetDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: technical_catalogs_1.ASSET_CRITICALITY_VALUES, default: 'medium' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(technical_catalogs_1.ASSET_CRITICALITY_VALUES),
    __metadata("design:type", Object)
], CreateAssetDto.prototype, "criticality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ isArray: true, type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(50, { each: true }),
    __metadata("design:type", Array)
], CreateAssetDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ isArray: true, type: String, description: 'Servicios a los que da soporte (al menos uno).' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], CreateAssetDto.prototype, "service_ids", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], CreateAssetDto.prototype, "responsible_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Solo viaja al crear: se guarda cifrado y nunca se devuelve. Los campos dependen de la conexión.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAssetDto.prototype, "credentials", void 0);
class ScheduleDto {
    frequency;
}
exports.ScheduleDto = ScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: technical_catalogs_1.SCHEDULE_FREQUENCY_VALUES }),
    (0, class_validator_1.IsIn)(technical_catalogs_1.SCHEDULE_FREQUENCY_VALUES),
    __metadata("design:type", Object)
], ScheduleDto.prototype, "frequency", void 0);
class ListAssetsQuery {
    page = 1;
    page_size = 25;
    service_id;
    connection_category;
    operational_status;
}
exports.ListAssetsQuery = ListAssetsQuery;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], ListAssetsQuery.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 25, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Object)
], ListAssetsQuery.prototype, "page_size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ListAssetsQuery.prototype, "service_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: technical_catalogs_1.CONNECTION_CATEGORY_VALUES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(technical_catalogs_1.CONNECTION_CATEGORY_VALUES),
    __metadata("design:type", Object)
], ListAssetsQuery.prototype, "connection_category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['operational', 'warning', 'error', 'not_monitored'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['operational', 'warning', 'error', 'not_monitored']),
    __metadata("design:type", String)
], ListAssetsQuery.prototype, "operational_status", void 0);
//# sourceMappingURL=technical-control.dtos.js.map