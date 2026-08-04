import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Query, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiCookieAuth } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
import express from "express";
import { ResponseDto } from "src/common/dtos/response.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { ClientCredentialsGuard } from "src/common/guards/client-credentials.guard";
import { Role } from "src/common/enums/role.enum";
import { CompleteOnboardingDto } from "../application/dtos/complete-onboarding.dto";
import { UpsertCompanyProfileDto } from "../application/dtos/upsert-company-profile.dto";
import { CompleteOnboardingUseCase } from "../application/use-cases/complete-onboarding.use-case";
import { GetCompanyProfileUseCase } from "../application/use-cases/get-company-profile.use-case";
import { UpsertCompanyProfileUseCase } from "../application/use-cases/upsert-company-profile.use-case";
import { GetOnboardingMasterTemplatesUseCase } from "../application/use-cases/get-onboarding-master-templates.use-case";

@Controller('onboarding')
export class OnboardingController {
    constructor(
        private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
        private readonly getCompanyProfileUseCase: GetCompanyProfileUseCase,
        private readonly upsertCompanyProfileUseCase: UpsertCompanyProfileUseCase,
        private readonly getOnboardingMasterTemplatesUseCase: GetOnboardingMasterTemplatesUseCase,
        private readonly i18n: I18nService,
    ) { }

    /**
     * Sin guard, protegido con el propio onboarding_code (query param) — el
     * cliente todavía no tiene sesión ni tenant en este punto del flujo.
     */
    @Get('master-templates')
    async masterTemplates(@Query('onboarding_code') onboardingCode: string) {
        const templates = await this.getOnboardingMasterTemplatesUseCase.execute(onboardingCode);
        return new ResponseDto({
            statusCode: HttpStatus.OK,
            message: this.i18n.t('onboarding.MASTER_TEMPLATES_READ'),
            data: templates,
        });
    }

    /**
     * Sin ningún guard a propósito: todavía no existe tenant (ni DB, ni
     * mnk-client-identifier/mnk-client-key) — el onboarding_code en el body
     * es la única credencial en este punto del flujo.
     */
    @Post('complete')
    async complete(
        @Body() dto: CompleteOnboardingDto,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        let result;
        try {
            result = await this.completeOnboardingUseCase.execute(dto);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error('Error completing onboarding:', error);
            throw new HttpException(this.i18n.t('onboarding.ADMIN_CREATE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3 * 60 * 60 * 1000,
        });
        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return new ResponseDto({
            statusCode: HttpStatus.CREATED,
            message: this.i18n.t('onboarding.COMPLETED'),
            data: {
                user: result.user,
                client_identifier: result.client_identifier,
                client_key: result.client_key,
            },
        });
    }

    @Get('company-profile')
    @ApiCookieAuth()
    @UseGuards(AuthGuard('jwt'), ClientCredentialsGuard)
    async getCompanyProfile() {
        try {
            const profile = await this.getCompanyProfileUseCase.execute();
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('onboarding.PROFILE_READ'),
                data: profile,
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error('Error reading company profile:', error);
            throw new HttpException(this.i18n.t('onboarding.PROFILE_READ_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('company-profile')
    @ApiCookieAuth()
    @UseGuards(AuthGuard('jwt'), ClientCredentialsGuard, RolesGuard)
    @Roles(Role.CLIENT_ADMIN)
    async upsertCompanyProfile(@Body() dto: UpsertCompanyProfileDto) {
        try {
            const profile = await this.upsertCompanyProfileUseCase.execute(dto);
            return new ResponseDto({
                statusCode: HttpStatus.OK,
                message: this.i18n.t('onboarding.PROFILE_UPDATED'),
                data: profile,
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error('Error updating company profile:', error);
            throw new HttpException(this.i18n.t('onboarding.PROFILE_UPDATE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
