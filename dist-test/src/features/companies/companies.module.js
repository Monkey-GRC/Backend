"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const company_repository_1 = require("./domain/repositories/company.repository");
const access_key_policy_token_1 = require("./application/access-key-policy.token");
const get_company_use_case_1 = require("./application/use-cases/get-company.use-case");
const list_companies_use_case_1 = require("./application/use-cases/list-companies.use-case");
const register_company_use_case_1 = require("./application/use-cases/register-company.use-case");
const company_prisma_repository_1 = require("./infrastructure/repositories/company.prisma.repository");
const companies_controller_1 = require("./presentation/companies.controller");
let CompaniesModule = class CompaniesModule {
};
exports.CompaniesModule = CompaniesModule;
exports.CompaniesModule = CompaniesModule = __decorate([
    (0, common_1.Module)({
        controllers: [companies_controller_1.CompaniesController],
        providers: [
            {
                provide: access_key_policy_token_1.ACCESS_KEY_TTL_HOURS,
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const hours = Number(config.getOrThrow('ACCESS_KEY_TTL_HOURS'));
                    if (!Number.isInteger(hours) || hours <= 0) {
                        throw new Error('ACCESS_KEY_TTL_HOURS debe ser un entero > 0');
                    }
                    return hours;
                },
            },
            { provide: company_repository_1.CompanyRepository, useClass: company_prisma_repository_1.CompanyPrismaRepository },
            register_company_use_case_1.RegisterCompanyUseCase,
            list_companies_use_case_1.ListCompaniesUseCase,
            get_company_use_case_1.GetCompanyUseCase,
        ],
    })
], CompaniesModule);
//# sourceMappingURL=companies.module.js.map