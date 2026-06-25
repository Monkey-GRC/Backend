import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiCookieAuth } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
import { ResponseDto } from "src/common/dtos/response.dto";
import { CreateRiskDto } from "../application/dtos/create-risk.dto";
import { UpdateRiskDto } from "../application/dtos/update-risk.dto";
import { CreateRiskUseCase } from "../application/use-cases/create-risk.use-case";
import { GetAllRisksUseCase } from "../application/use-cases/get-all-risks.use-case";
import { UpdateRiskUseCase } from "../application/use-cases/update-risk.use-case";
import { DeleteRiskUseCase } from "../application/use-cases/delete-risk.use-case";

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('risks')
export class RiskController {
    constructor(
        private readonly createRiskUseCase: CreateRiskUseCase,
        private readonly getAllRisksUseCase: GetAllRisksUseCase,
        private readonly updateRiskUseCase: UpdateRiskUseCase,
        private readonly deleteRiskUseCase: DeleteRiskUseCase,
        private readonly i18n: I18nService,
    ) { }

    @Post()
    async createRisk(@Req() req: any, @Body() body: CreateRiskDto) {
        try {
            await this.createRiskUseCase.execute(body, req.user.id);
            return new ResponseDto({
                statusCode: HttpStatus.CREATED,
                message: this.i18n.t('risk.CREATED'),
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

    @Patch(':id')
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
