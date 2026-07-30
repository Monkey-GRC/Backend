import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiCookieAuth } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
import { Role } from "src/common/enums/role.enum";
import { ResponseDto } from "src/common/dtos/response.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { TenantResolutionGuard } from "src/common/guards/tenant-resolution.guard";
import { CreateTemplateDto } from "../application/dtos/create-template.dto";
import { UpdateTemplateDto } from "../application/dtos/update-template.dto";
import { CreateTemplateUseCase } from "../application/use-cases/create-template.use-case";
import { GetAllTemplatesUseCase } from "../application/use-cases/get-all-templates.use-case";
import { GetOneTemplateUseCase } from "../application/use-cases/get-one-template.use-case";
import { UpdateTemplateUseCase } from "../application/use-cases/update-template.use-case";
import { DeleteTemplateUseCase } from "../application/use-cases/delete-template.use-case";
import { GetAllMasterTemplatesUseCase } from "../application/use-cases/get-all-master-templates.use-case";
import { AdoptTemplateUseCase } from "../application/use-cases/adopt-template.use-case";

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'), TenantResolutionGuard, RolesGuard)
@Controller('templates')
export class TemplateController {
    constructor(
        private readonly createTemplateUseCase: CreateTemplateUseCase,
        private readonly getAllTemplatesUseCase: GetAllTemplatesUseCase,
        private readonly getOneTemplateUseCase: GetOneTemplateUseCase,
        private readonly updateTemplateUseCase: UpdateTemplateUseCase,
        private readonly deleteTemplateUseCase: DeleteTemplateUseCase,
        private readonly getAllMasterTemplatesUseCase: GetAllMasterTemplatesUseCase,
        private readonly adoptTemplateUseCase: AdoptTemplateUseCase,
        private readonly i18n: I18nService,
    ) { }

    @Post()
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async createTemplate(@Req() req: any, @Body() body: CreateTemplateDto) {
        try {
            const template = await this.createTemplateUseCase.execute(body, req.user.id);
            return new ResponseDto({
                statusCode: HttpStatus.CREATED,
                message: this.i18n.t('template.CREATED'),
                data: template,
            });
        } catch (error) {
            // No usar `instanceof Prisma.PrismaClientKnownRequestError`: esta ruta
            // corre tanto contra la DB central como contra la de un tenant, cada
            // una con su propio cliente Prisma generado (clases distintas) — el
            // código de error sí es consistente entre ambas.
            if ((error as any)?.code === 'P2002') {
                throw new HttpException(this.i18n.t('template.DUPLICATE_SLUG'), HttpStatus.CONFLICT);
            }
            console.error('Error creating template:', error);
            throw new HttpException(this.i18n.t('template.CREATE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('master')
    async getAllMasterTemplates() {
        try {
            const templates = await this.getAllMasterTemplatesUseCase.execute();
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('template.READ.ALL'),
                data: templates,
            });
        } catch (error) {
            console.error('Error fetching master templates:', error);
            throw new HttpException(this.i18n.t('template.READ_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('master/:id/adopt')
    @Roles(Role.CLIENT_ADMIN)
    async adoptMasterTemplate(@Param('id') id: string) {
        try {
            const template = await this.adoptTemplateUseCase.execute(id);
            return new ResponseDto({
                statusCode: HttpStatus.CREATED,
                message: this.i18n.t('template.ADOPTED'),
                data: template,
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error('Error adopting master template:', error);
            throw new HttpException(this.i18n.t('template.ADOPT_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
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
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
    async updateTemplate(@Req() req: any, @Param('id') id: string, @Body() body: UpdateTemplateDto) {
        try {
            const template = await this.updateTemplateUseCase.execute(id, body, req.user.id);
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('template.UPDATED'),
                data: template,
            });
        } catch (error) {
            if ((error as any)?.code === 'P2002') {
                throw new HttpException(this.i18n.t('template.DUPLICATE_SLUG'), HttpStatus.CONFLICT);
            }
            console.error('Error updating template:', error);
            throw new HttpException(this.i18n.t('template.UPDATE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    @Roles(Role.MONKEY_ADMIN, Role.CLIENT_ADMIN)
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
