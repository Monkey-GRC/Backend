import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ClientCredentialsGuard } from 'src/common/guards/client-credentials.guard';
import { CreateAssetDto } from '../application/dtos/create-asset.dto';
import { UpdateAssetDto } from '../application/dtos/update-asset.dto';
import { CreateAssetUseCase } from '../application/use-cases/create-asset.use-case';
import { GetAllAssetsUseCase } from '../application/use-cases/get-all-assets.use-case';
import { GetOneAssetUseCase } from '../application/use-cases/get-one-asset.use-case';
import { UpdateAssetUseCase } from '../application/use-cases/update-asset.use-case';
import { DeleteAssetUseCase } from '../application/use-cases/delete-asset.use-case';
import { GetAssetComplianceUseCase } from '../application/use-cases/get-asset-compliance.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'), ClientCredentialsGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Controller('assets')
export class AssetController {
    constructor(
        private readonly createAssetUseCase: CreateAssetUseCase,
        private readonly getAllAssetsUseCase: GetAllAssetsUseCase,
        private readonly getOneAssetUseCase: GetOneAssetUseCase,
        private readonly updateAssetUseCase: UpdateAssetUseCase,
        private readonly deleteAssetUseCase: DeleteAssetUseCase,
        private readonly getAssetComplianceUseCase: GetAssetComplianceUseCase,
    ) { }

    @Post()
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async create(@Req() req: any, @Body() body: CreateAssetDto) {
        const data = await this.createAssetUseCase.execute(body, req.user.id);
        return new ResponseDto({ statusCode: HttpStatus.CREATED, message: 'Activo creado', data });
    }

    @Get()
    async findAll() {
        const data = await this.getAllAssetsUseCase.execute();
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Activos obtenidos', data });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.getOneAssetUseCase.execute(id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Activo obtenido', data });
    }

    @Get(':id/compliance')
    async findCompliance(@Param('id') id: string) {
        const data = await this.getAssetComplianceUseCase.execute(id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Cumplimiento del activo obtenido', data });
    }

    @Patch(':id')
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateAssetDto) {
        await this.updateAssetUseCase.execute(id, body, req.user.id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Activo actualizado' });
    }

    @Delete(':id')
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async remove(@Param('id') id: string) {
        await this.deleteAssetUseCase.execute(id);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Activo eliminado' });
    }
}
