"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingModule = void 0;
const common_1 = require("@nestjs/common");
const organizational_context_repository_1 = require("./domain/repositories/organizational-context.repository");
const get_organizational_context_use_case_1 = require("./application/use-cases/get-organizational-context.use-case");
const save_organizational_context_use_case_1 = require("./application/use-cases/save-organizational-context.use-case");
const organizational_context_prisma_repository_1 = require("./infrastructure/repositories/organizational-context.prisma.repository");
const onboarding_controller_1 = require("./presentation/onboarding.controller");
let OnboardingModule = class OnboardingModule {
};
exports.OnboardingModule = OnboardingModule;
exports.OnboardingModule = OnboardingModule = __decorate([
    (0, common_1.Module)({
        controllers: [onboarding_controller_1.OnboardingController],
        providers: [
            { provide: organizational_context_repository_1.OrganizationalContextRepository, useClass: organizational_context_prisma_repository_1.OrganizationalContextPrismaRepository },
            get_organizational_context_use_case_1.GetOrganizationalContextUseCase,
            save_organizational_context_use_case_1.SaveOrganizationalContextUseCase,
        ],
    })
], OnboardingModule);
//# sourceMappingURL=onboarding.module.js.map