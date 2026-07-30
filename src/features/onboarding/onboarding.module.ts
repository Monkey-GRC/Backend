import { Module } from "@nestjs/common";
import { AuthModule } from "src/features/auth/auth.module";
import { OnboardingController } from "./presentation/onboarding.controller";
import { CompanyProfileRepository } from "./domain/repositories/company-profile.repository";
import { CompanyProfilePrismaRepository } from "./infrastructure/repositories/company-profile.prisma.repository";
import { CreateOnboardingAdminUseCase } from "./application/use-cases/create-onboarding-admin.use-case";
import { GetCompanyProfileUseCase } from "./application/use-cases/get-company-profile.use-case";
import { UpsertCompanyProfileUseCase } from "./application/use-cases/upsert-company-profile.use-case";

@Module({
    imports: [AuthModule],
    controllers: [OnboardingController],
    providers: [
        {
            provide: CompanyProfileRepository,
            useClass: CompanyProfilePrismaRepository,
        },
        CreateOnboardingAdminUseCase,
        GetCompanyProfileUseCase,
        UpsertCompanyProfileUseCase,
    ],
})
export class OnboardingModule { }
