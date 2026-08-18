import { Body, Controller, Get, HttpStatus, Param, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ClientCredentialsGuard } from 'src/common/guards/client-credentials.guard';
import { CreateManualCheckDto } from '../application/dtos/create-manual-check.dto';
import { CreateManualCheckUseCase } from '../application/use-cases/create-manual-check.use-case';
import { ListManualChecksUseCase } from '../application/use-cases/list-manual-checks.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'), ClientCredentialsGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Controller('controls/:controlId/manual-checks')
export class ManualCheckController {
    constructor(
        private readonly createManualCheckUseCase: CreateManualCheckUseCase,
        private readonly listManualChecksUseCase: ListManualChecksUseCase,
    ) {}

    @Post()
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async create(@Req() req: any, @Param('controlId') controlId: string, @Body() body: CreateManualCheckDto) {
        const data = await this.createManualCheckUseCase.execute(controlId, body, req.user.id);
        return new ResponseDto({ statusCode: HttpStatus.CREATED, message: 'Check manual creado', data });
    }

    @Get()
    async findAll(@Param('controlId') controlId: string) {
        const data = await this.listManualChecksUseCase.execute(controlId);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Checks manuales obtenidos', data });
    }
}
