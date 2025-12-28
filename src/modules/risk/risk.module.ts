import { Module } from "@nestjs/common";
import { RiskController } from "./risk.controller";
import { RiskService } from "./risk.service";

@Module({
    providers: [RiskService],
    controllers: [RiskController],
})
export class RiskModule {}