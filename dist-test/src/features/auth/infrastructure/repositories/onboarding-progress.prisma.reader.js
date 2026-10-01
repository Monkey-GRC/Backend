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
exports.OnboardingProgressPrismaReader = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const onboarding_progress_reader_1 = require("../../domain/ports/onboarding-progress.reader");
let OnboardingProgressPrismaReader = class OnboardingProgressPrismaReader extends onboarding_progress_reader_1.OnboardingProgressReader {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async hasOrganizationalContext(scope) {
        const count = await this.prisma.withScope(scope, (tx) => tx.organization.count({ where: { companyId: scope.companyId } }));
        return count > 0;
    }
    async hasDeclaredService(scope) {
        const count = await this.prisma.withScope(scope, (tx) => tx.service.count({
            where: {
                organization: { companyId: scope.companyId },
                frameworks: { some: { status: 'active' } },
                systemDescription: { isNot: null },
            },
        }));
        return count > 0;
    }
    async hasTechnicalControl(scope) {
        const count = await this.prisma.withScope(scope, (tx) => tx.service.count({
            where: {
                organization: { companyId: scope.companyId },
                deploymentScenario: { not: null },
                scope: { isNot: null },
            },
        }));
        return count > 0;
    }
};
exports.OnboardingProgressPrismaReader = OnboardingProgressPrismaReader;
exports.OnboardingProgressPrismaReader = OnboardingProgressPrismaReader = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OnboardingProgressPrismaReader);
//# sourceMappingURL=onboarding-progress.prisma.reader.js.map