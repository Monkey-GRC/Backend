import { Module } from "@nestjs/common";
import { ReasonController } from "./controllers/reason.controller";
import { RiskController } from "./controllers/risk.controller";
import { ReasonService } from "./services/reason.service";
import { RiskService } from "./services/risk.service";

@Module({
    imports: [],
    controllers: [ReasonController, RiskController],
    providers: [ReasonService, RiskService],
})
export class GrcFrameworkModule { }