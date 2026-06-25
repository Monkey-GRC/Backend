import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { CreateControlDto } from '../application/dtos/create-control.dto';
import { UpdateControlDto } from '../application/dtos/update-control.dto';
import { CreateControlUseCase } from '../application/use-cases/create-control.use-case';
import { GetAllControlsUseCase } from '../application/use-cases/get-all-controls.use-case';
import { UpdateControlUseCase } from '../application/use-cases/update-control.use-case';
import { DeleteControlUseCase } from '../application/use-cases/delete-control.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('controls')
export class ControlController {
    constructor(
        private readonly createControlUseCase: CreateControlUseCase,
        private readonly getAllControlsUseCase: GetAllControlsUseCase,
        private readonly updateControlUseCase: UpdateControlUseCase,
        private readonly deleteControlUseCase: DeleteControlUseCase,
    ) { }

    @Post()
    async create(@Req() req: any, @Body() body: CreateControlDto) {
        await this.createControlUseCase.execute(body, req.user.id);
        return new ResponseDto({ statusCode: HttpStatus.CREATED, message: 'Control creado' });
    }

    @Get()
    async findAll() {
        const data = await this.getAllControlsUseCase.execute();
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Controles obtenidos', data });
    }

    @Patch(':id')
    async update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateControlDto) {
        await this.updateControlUseCase.execute(id, body, req.user.id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Control actualizado' });
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.deleteControlUseCase.execute(id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Control eliminado' });
    }
}
