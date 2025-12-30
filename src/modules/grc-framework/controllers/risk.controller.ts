import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiCookieAuth } from "@nestjs/swagger";
import { RiskService } from "../services/risk.service";
import { ResponseDto } from "src/shared/dtos/response.dto";
import { I18nService } from "nestjs-i18n";
import { CreateRiskDto } from "../dtos/risk/create-risk.dto";

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('risks')
export class RiskController {

    constructor(
        private readonly riskService: RiskService,
        private readonly i18n: I18nService
    ) { }

    @Post()
    async createRisk(@Req() req: any, @Body() body: CreateRiskDto) {
        try {
            const risk = await this.riskService.createRisk({
                name: body.name,
                description: body.description,
                impact: body.impact,
                probability: body.probability,
                created_by_user: {
                    connect: { id: req.user.id }
                }
            });
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
            const risks = await this.riskService.getAllRisks();
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
    async updateRisk(@Req() req: any, @Param('id') id: string, @Body() body: CreateRiskDto) {
        try {
            const risk = await this.riskService.updateRisk(id, {
                name: body.name,
                description: body.description,
                updated_by_user: {
                    connect: { id: req.user.id }
                }
            });
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
            const risk = await this.riskService.deleteRisk(id);
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('risk.DELETED'),
            });
        } catch (error) {
            console.error('Error updating risk:', error);
            throw new HttpException(this.i18n.t('risk.DELETE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}