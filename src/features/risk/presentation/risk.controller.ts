import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiCookieAuth } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
import { Role } from "src/common/enums/role.enum";
import { ResponseDto } from "src/common/dtos/response.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { TenantResolutionGuard } from "src/common/guards/tenant-resolution.guard";
import { CreateRiskDto } from "../application/dtos/create-risk.dto";
import { UpdateRiskDto } from "../application/dtos/update-risk.dto";
import { CreateRiskUseCase } from "../application/use-cases/create-risk.use-case";
import { GetAllRisksUseCase } from "../application/use-cases/get-all-risks.use-case";
import { GetOneRiskUseCase } from "../application/use-cases/get-one-risk.use-case";
import { UpdateRiskUseCase } from "../application/use-cases/update-risk.use-case";
import { DeleteRiskUseCase } from "../application/use-cases/delete-risk.use-case";

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'), TenantResolutionGuard, RolesGuard)
@Controller('risks')
export class RiskController {
    constructor(
        private readonly createRiskUseCase: CreateRiskUseCase,
        private readonly getAllRisksUseCase: GetAllRisksUseCase,
        private readonly getOneRiskUseCase: GetOneRiskUseCase,
        private readonly updateRiskUseCase: UpdateRiskUseCase,
        private readonly deleteRiskUseCase: DeleteRiskUseCase,
        private readonly i18n: I18nService,
    ) { }

    @Post()
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async createRisk(@Req() req: any, @Body() body: CreateRiskDto) {
        try {
            const data = await this.createRiskUseCase.execute(body, req.user.id);
            return new ResponseDto({
                statusCode: HttpStatus.CREATED,
                message: this.i18n.t('risk.CREATED'),
                data,
            });
        } catch (error) {
            console.error('Error creating risk:', error);
            throw new HttpException(this.i18n.t('risk.CREATE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async getAllRisks() {
        try {
            const risks = await this.getAllRisksUseCase.execute();
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('risk.READ.ALL'),
                data: risks,
            });
        } catch (error) {
            console.error('Error fetching risks:', error);
            throw new HttpException(this.i18n.t('risk.READ_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async getOneRisk(@Param('id') id: string) {
        try {
            const risk = await this.getOneRiskUseCase.execute(id);
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('risk.READ.ONE'),
                data: risk,
            });
        } catch (error) {
            console.error('Error fetching risk:', error);
            throw new HttpException(this.i18n.t('risk.NOT_FOUND'), HttpStatus.NOT_FOUND);
        }
    }

    @Patch(':id')
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async updateRisk(@Req() req: any, @Param('id') id: string, @Body() body: UpdateRiskDto) {
        try {
            await this.updateRiskUseCase.execute(id, body, req.user.id);
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('risk.UPDATED'),
            });
        } catch (error) {
            console.error('Error updating risk:', error);
            throw new HttpException(this.i18n.t('risk.UPDATE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async deleteRisk(@Param('id') id: string) {
        try {
            await this.deleteRiskUseCase.execute(id);
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('risk.DELETED'),
            });
        } catch (error) {
            console.error('Error deleting risk:', error);
            throw new HttpException(this.i18n.t('risk.DELETE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
