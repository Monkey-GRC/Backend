import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth } from '@nestjs/swagger';
import { Role } from 'generated/prisma/client';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateControlDto } from '../application/dtos/create-control.dto';
import { UpdateControlDto } from '../application/dtos/update-control.dto';
import { CreateControlUseCase } from '../application/use-cases/create-control.use-case';
import { GetAllControlsUseCase } from '../application/use-cases/get-all-controls.use-case';
import { GetOneControlUseCase } from '../application/use-cases/get-one-control.use-case';
import { UpdateControlUseCase } from '../application/use-cases/update-control.use-case';
import { DeleteControlUseCase } from '../application/use-cases/delete-control.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Controller('controls')
export class ControlController {
    constructor(
        private readonly createControlUseCase: CreateControlUseCase,
        private readonly getAllControlsUseCase: GetAllControlsUseCase,
        private readonly getOneControlUseCase: GetOneControlUseCase,
        private readonly updateControlUseCase: UpdateControlUseCase,
        private readonly deleteControlUseCase: DeleteControlUseCase,
    ) { }

    @Post()
    @Roles(Role.MONKEY_ADMIN)
    async create(@Req() req: any, @Body() body: CreateControlDto) {
        await this.createControlUseCase.execute(body, req.user.id);
        return new ResponseDto({ statusCode: HttpStatus.CREATED, message: 'Control creado' });
    }

    @Get()
    async findAll() {
        const data = await this.getAllControlsUseCase.execute();
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Controles obtenidos', data });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.getOneControlUseCase.execute(id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Control obtenido', data });
    }

    @Patch(':id')
    @Roles(Role.MONKEY_ADMIN)
    async update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateControlDto) {
        await this.updateControlUseCase.execute(id, body, req.user.id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Control actualizado' });
    }

    @Delete(':id')
    @Roles(Role.MONKEY_ADMIN)
    async remove(@Param('id') id: string) {
        await this.deleteControlUseCase.execute(id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Control eliminado' });
    }
}
