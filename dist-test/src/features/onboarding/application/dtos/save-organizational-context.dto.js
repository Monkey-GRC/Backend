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
exports.SaveOrganizationalContextDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const onboarding_catalogs_1 = require("../../../../common/catalogs/onboarding-catalogs");
const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);
class SaveOrganizationalContextDto {
    name;
    description;
    size;
    industry;
    business_model;
    years_in_operation;
    incorporation_countries;
    client_countries;
    compliance_maturity;
    regulation_codes;
}
exports.SaveOrganizationalContextDto = SaveOrganizationalContextDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'No se acepta: la razón social es solo lectura.' }),
    (0, class_validator_1.IsEmpty)(),
    __metadata("design:type", String)
], SaveOrganizationalContextDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Consultoría de auditoría y cumplimiento para empresas de servicios en LATAM.' }),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], SaveOrganizationalContextDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: onboarding_catalogs_1.SIZE_VALUES }),
    (0, class_validator_1.IsIn)(onboarding_catalogs_1.SIZE_VALUES),
    __metadata("design:type", Object)
], SaveOrganizationalContextDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: onboarding_catalogs_1.INDUSTRY_VALUES }),
    (0, class_validator_1.IsIn)(onboarding_catalogs_1.INDUSTRY_VALUES),
    __metadata("design:type", Object)
], SaveOrganizationalContextDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: onboarding_catalogs_1.BUSINESS_MODEL_VALUES }),
    (0, class_validator_1.IsIn)(onboarding_catalogs_1.BUSINESS_MODEL_VALUES),
    __metadata("design:type", Object)
], SaveOrganizationalContextDto.prototype, "business_model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: onboarding_catalogs_1.YEARS_IN_OPERATION_VALUES, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(onboarding_catalogs_1.YEARS_IN_OPERATION_VALUES),
    __metadata("design:type", Object)
], SaveOrganizationalContextDto.prototype, "years_in_operation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: onboarding_catalogs_1.INCORPORATION_COUNTRY_VALUES, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsIn)(onboarding_catalogs_1.INCORPORATION_COUNTRY_VALUES, { each: true }),
    __metadata("design:type", Array)
], SaveOrganizationalContextDto.prototype, "incorporation_countries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: onboarding_catalogs_1.CLIENT_COUNTRY_VALUES, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsIn)(onboarding_catalogs_1.CLIENT_COUNTRY_VALUES, { each: true }),
    __metadata("design:type", Array)
], SaveOrganizationalContextDto.prototype, "client_countries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: onboarding_catalogs_1.COMPLIANCE_MATURITY_VALUES }),
    (0, class_validator_1.IsIn)(onboarding_catalogs_1.COMPLIANCE_MATURITY_VALUES),
    __metadata("design:type", Object)
], SaveOrganizationalContextDto.prototype, "compliance_maturity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: onboarding_catalogs_1.REGULATION_CODES, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsIn)(onboarding_catalogs_1.REGULATION_CODES, { each: true }),
    __metadata("design:type", Array)
], SaveOrganizationalContextDto.prototype, "regulation_codes", void 0);
//# sourceMappingURL=save-organizational-context.dto.js.map