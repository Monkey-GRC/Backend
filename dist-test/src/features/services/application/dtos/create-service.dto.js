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
exports.CreateServiceDto = exports.SystemDescriptionDto = exports.SubserviceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const onboarding_catalogs_1 = require("../../../../common/catalogs/onboarding-catalogs");
const service_catalogs_1 = require("../../../../common/catalogs/service-catalogs");
const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);
const trimOrNull = ({ value }) => typeof value === 'string' ? value.trim() || null : value;
class SubserviceDto {
    type;
    provider;
    service_provided;
    responsibility;
}
exports.SubserviceDto = SubserviceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: service_catalogs_1.SUBSERVICE_TYPE_VALUES }),
    (0, class_validator_1.IsIn)(service_catalogs_1.SUBSERVICE_TYPE_VALUES),
    __metadata("design:type", Object)
], SubserviceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true, example: 'Amazon Web Services' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimOrNull),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", Object)
], SubserviceDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true, example: 'Cómputo y almacenamiento' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimOrNull),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", Object)
], SubserviceDto.prototype, "service_provided", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimOrNull),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", Object)
], SubserviceDto.prototype, "responsibility", void 0);
class SystemDescriptionDto {
    kind;
    url;
}
exports.SystemDescriptionDto = SystemDescriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['link'] }),
    (0, class_validator_1.IsIn)(['link']),
    __metadata("design:type", String)
], SystemDescriptionDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://docs.ejemplo.com/system-description-v2.pdf' }),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsUrl)({ protocols: ['http', 'https'], require_protocol: true }),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], SystemDescriptionDto.prototype, "url", void 0);
class CreateServiceDto {
    name;
    description;
    scope_statement;
    type;
    industries_served;
    active_client_count;
    countries;
    data_types;
    trust_criteria;
    subservice_organizations;
    framework_codes;
    regulation_codes;
    previous_certification;
    expected_availability;
    system_description;
}
exports.CreateServiceDto = CreateServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mesa de servicio gestionada' }),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "scope_statement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: service_catalogs_1.SERVICE_TYPE_VALUES }),
    (0, class_validator_1.IsIn)(service_catalogs_1.SERVICE_TYPE_VALUES),
    __metadata("design:type", Object)
], CreateServiceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: service_catalogs_1.SERVED_INDUSTRY_VALUES, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsIn)(service_catalogs_1.SERVED_INDUSTRY_VALUES, { each: true }),
    __metadata("design:type", Array)
], CreateServiceDto.prototype, "industries_served", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: service_catalogs_1.ACTIVE_CLIENT_COUNT_VALUES, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(service_catalogs_1.ACTIVE_CLIENT_COUNT_VALUES),
    __metadata("design:type", Object)
], CreateServiceDto.prototype, "active_client_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: service_catalogs_1.SERVICE_COUNTRY_VALUES, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsIn)(service_catalogs_1.SERVICE_COUNTRY_VALUES, { each: true }),
    __metadata("design:type", Array)
], CreateServiceDto.prototype, "countries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: service_catalogs_1.DATA_TYPE_VALUES, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsIn)(service_catalogs_1.DATA_TYPE_VALUES, { each: true }),
    __metadata("design:type", Array)
], CreateServiceDto.prototype, "data_types", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: service_catalogs_1.TRUST_CRITERION_VALUES,
        isArray: true,
        description: 'Si falta `security`, el servidor la añade.',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsIn)(service_catalogs_1.TRUST_CRITERION_VALUES, { each: true }),
    __metadata("design:type", Array)
], CreateServiceDto.prototype, "trust_criteria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => [SubserviceDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SubserviceDto),
    __metadata("design:type", Array)
], CreateServiceDto.prototype, "subservice_organizations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ isArray: true, example: ['soc2'], description: 'Opciones en GET /v1/catalogs/frameworks.' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateServiceDto.prototype, "framework_codes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: onboarding_catalogs_1.REGULATION_CODES, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsIn)(onboarding_catalogs_1.REGULATION_CODES, { each: true }),
    __metadata("design:type", Array)
], CreateServiceDto.prototype, "regulation_codes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: service_catalogs_1.PREVIOUS_CERTIFICATION_VALUES, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(service_catalogs_1.PREVIOUS_CERTIFICATION_VALUES),
    __metadata("design:type", Object)
], CreateServiceDto.prototype, "previous_certification", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: service_catalogs_1.EXPECTED_AVAILABILITY_VALUES }),
    (0, class_validator_1.IsIn)(service_catalogs_1.EXPECTED_AVAILABILITY_VALUES),
    __metadata("design:type", Object)
], CreateServiceDto.prototype, "expected_availability", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => SystemDescriptionDto }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SystemDescriptionDto),
    __metadata("design:type", SystemDescriptionDto)
], CreateServiceDto.prototype, "system_description", void 0);
//# sourceMappingURL=create-service.dto.js.map