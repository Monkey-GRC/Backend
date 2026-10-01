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
exports.RedeemAccessKeyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const password_policy_1 = require("../../../../common/security/password-policy");
const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);
class RedeemAccessKeyDto {
    code;
    email;
    password;
    name;
    last_name;
}
exports.RedeemAccessKeyDto = RedeemAccessKeyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MNK-7F3A-92KD-5QXB' }),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], RedeemAccessKeyDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ana.perez@ejemplo.com', description: 'Debe ser el correo administrativo registrado' }),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(254),
    __metadata("design:type", String)
], RedeemAccessKeyDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'UnaClaveLarga123!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(128),
    (0, class_validator_1.IsStrongPassword)({
        minLength: password_policy_1.PASSWORD_MIN_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }),
    __metadata("design:type", String)
], RedeemAccessKeyDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ana' }),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], RedeemAccessKeyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pérez' }),
    (0, class_transformer_1.Transform)(trim),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], RedeemAccessKeyDto.prototype, "last_name", void 0);
//# sourceMappingURL=redeem-access-key.dto.js.map