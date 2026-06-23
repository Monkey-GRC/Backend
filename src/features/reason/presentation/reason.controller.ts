import { Controller, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiCookieAuth } from "@nestjs/swagger";

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reasons')
export class ReasonController { }
