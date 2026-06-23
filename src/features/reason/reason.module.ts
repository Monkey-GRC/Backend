import { Module } from "@nestjs/common";
import { ReasonController } from "./presentation/reason.controller";
import { ReasonService } from "./application/reason.service";

@Module({
    controllers: [ReasonController],
    providers: [ReasonService],
})
export class ReasonModule { }
