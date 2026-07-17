import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiCookieAuth } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
import { ResponseDto } from "src/common/dtos/response.dto";
import { CreateTemplateDto } from "../application/dtos/create-template.dto";
import { UpdateTemplateDto } from "../application/dtos/update-template.dto";
import { CreateTemplateUseCase } from "../application/use-cases/create-template.use-case";
import { GetAllTemplatesUseCase } from "../application/use-cases/get-all-templates.use-case";
import { GetOneTemplateUseCase } from "../application/use-cases/get-one-template.use-case";
import { UpdateTemplateUseCase } from "../application/use-cases/update-template.use-case";
import { DeleteTemplateUseCase } from "../application/use-cases/delete-template.use-case";

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('templates')
export class TemplateController {
    constructor(
        private readonly createTemplateUseCase: CreateTemplateUseCase,
        private readonly getAllTemplatesUseCase: GetAllTemplatesUseCase,
        private readonly getOneTemplateUseCase: GetOneTemplateUseCase,
        private readonly updateTemplateUseCase: UpdateTemplateUseCase,
        private readonly deleteTemplateUseCase: DeleteTemplateUseCase,
        private readonly i18n: I18nService,
    ) { }

    @Post()
    async createTemplate(@Req() req: any, @Body() body: CreateTemplateDto) {
        try {
            await this.createTemplateUseCase.execute(body, req.user.id);
            return new ResponseDto({
                statusCode: HttpStatus.CREATED,
                message: this.i18n.t('template.CREATED'),
            });
        } catch (error) {
            console.error('Error creating template:', error);
            throw new HttpException(this.i18n.t('template.CREATE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async getAllTemplates() {
        try {
            const templates = await this.getAllTemplatesUseCase.execute();
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('template.READ.ALL'),
                data: templates,
            });
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw new HttpException(this.i18n.t('template.READ_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async getOneTemplate(@Param('id') id: string) {
        try {
            const template = await this.getOneTemplateUseCase.execute(id);
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('template.READ.ONE'),
                data: template,
            });
        } catch (error) {
            console.error('Error fetching template:', error);
            throw new HttpException(this.i18n.t('template.NOT_FOUND'), HttpStatus.NOT_FOUND);
        }
    }

    @Patch(':id')
    async updateTemplate(@Req() req: any, @Param('id') id: string, @Body() body: UpdateTemplateDto) {
        try {
            await this.updateTemplateUseCase.execute(id, body, req.user.id);
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('template.UPDATED'),
            });
        } catch (error) {
            console.error('Error updating template:', error);
            throw new HttpException(this.i18n.t('template.UPDATE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async deleteTemplate(@Param('id') id: string) {
        try {
            await this.deleteTemplateUseCase.execute(id);
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('template.DELETED'),
            });
        } catch (error) {
            console.error('Error deleting template:', error);
            throw new HttpException(this.i18n.t('template.DELETE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
