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
exports.GetCompanyUseCase = void 0;
const common_1 = require("@nestjs/common");
const domain_error_1 = require("../../../../common/errors/domain-error");
const company_repository_1 = require("../../domain/repositories/company.repository");
let GetCompanyUseCase = class GetCompanyUseCase {
    companies;
    constructor(companies) {
        this.companies = companies;
    }
    async execute(principal, companyId) {
        const detail = await this.companies.findById({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, companyId, principal.companyId);
        if (!detail)
            throw new domain_error_1.DomainError('NOT_FOUND');
        return detail;
    }
};
exports.GetCompanyUseCase = GetCompanyUseCase;
exports.GetCompanyUseCase = GetCompanyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [company_repository_1.CompanyRepository])
], GetCompanyUseCase);
//# sourceMappingURL=get-company.use-case.js.map