"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const nestjs_i18n_1 = require("nestjs-i18n");
const path_1 = __importDefault(require("path"));
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const auth_module_1 = require("./features/auth/auth.module");
const catalogs_module_1 = require("./features/catalogs/catalogs.module");
const companies_module_1 = require("./features/companies/companies.module");
const onboarding_module_1 = require("./features/onboarding/onboarding.module");
const services_module_1 = require("./features/services/services.module");
const technical_control_module_1 = require("./features/technical-control/technical-control.module");
const audit_module_1 = require("./infrastructure/audit/audit.module");
const database_module_1 = require("./infrastructure/database/database.module");
const security_module_1 = require("./infrastructure/security/security.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            nestjs_i18n_1.I18nModule.forRoot({
                fallbackLanguage: 'es',
                loaderOptions: {
                    path: path_1.default.join(process.cwd(), 'i18n'),
                    watch: true,
                },
                resolvers: [nestjs_i18n_1.AcceptLanguageResolver],
            }),
            database_module_1.DatabaseModule,
            audit_module_1.AuditModule,
            security_module_1.SecurityModule,
            auth_module_1.AuthModule,
            companies_module_1.CompaniesModule,
            catalogs_module_1.CatalogsModule,
            onboarding_module_1.OnboardingModule,
            services_module_1.ServicesModule,
            technical_control_module_1.TechnicalControlModule,
        ],
        providers: [{ provide: core_1.APP_FILTER, useClass: http_exception_filter_1.HttpExceptionFilter }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map