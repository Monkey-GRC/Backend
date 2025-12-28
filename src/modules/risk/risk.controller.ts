import { Controller, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller('risk')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class RiskController { }