import { Module } from "@nestjs/common";
import { AuthModule } from "src/features/auth/auth.module";
import { TemplateModule } from "src/features/template/template.module";
import { OnboardingController } from "./presentation/onboarding.controller";
import { CompanyProfileRepository } from "./domain/repositories/company-profile.repository";
import { CompanyProfilePrismaRepository } from "./infrastructure/repositories/company-profile.prisma.repository";
import { CompleteOnboardingUseCase } from "./application/use-cases/complete-onboarding.use-case";
import { GetCompanyProfileUseCase } from "./application/use-cases/get-company-profile.use-case";
import { UpsertCompanyProfileUseCase } from "./application/use-cases/upsert-company-profile.use-case";
import { GetOnboardingMasterTemplatesUseCase } from "./application/use-cases/get-onboarding-master-templates.use-case";

@Module({
    imports: [AuthModule, TemplateModule],
    controllers: [OnboardingController],
    providers: [
        {
            provide: CompanyProfileRepository,
            useClass: CompanyProfilePrismaRepository,
        },
        CompleteOnboardingUseCase,
        GetCompanyProfileUseCase,
        UpsertCompanyProfileUseCase,
        GetOnboardingMasterTemplatesUseCase,
    ],
})
export class OnboardingModule { }
