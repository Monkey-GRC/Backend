import { Module } from "@nestjs/common";
import { RiskController } from "./presentation/risk.controller";
import { RiskRepository } from "./domain/repositories/risk.repository";
import { RiskPrismaRepository } from "./infrastructure/repositories/risk.prisma.repository";
import { CreateRiskUseCase } from "./application/use-cases/create-risk.use-case";
import { GetAllRisksUseCase } from "./application/use-cases/get-all-risks.use-case";
import { GetOneRiskUseCase } from "./application/use-cases/get-one-risk.use-case";
import { UpdateRiskUseCase } from "./application/use-cases/update-risk.use-case";
import { DeleteRiskUseCase } from "./application/use-cases/delete-risk.use-case";

@Module({
    controllers: [RiskController],
    providers: [
        {
            provide: RiskRepository,
            useClass: RiskPrismaRepository,
        },
        CreateRiskUseCase,
        GetAllRisksUseCase,
        GetOneRiskUseCase,
        UpdateRiskUseCase,
        DeleteRiskUseCase,
    ],
})
export class RiskModule { }
