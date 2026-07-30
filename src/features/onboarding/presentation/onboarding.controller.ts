import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiCookieAuth } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
import express from "express";
import { ResponseDto } from "src/common/dtos/response.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { TenantResolutionGuard } from "src/common/guards/tenant-resolution.guard";
import { Role } from "src/common/enums/role.enum";
import { AuthService } from "src/features/auth/application/auth.service";
import { CreateOnboardingAdminDto } from "../application/dtos/create-onboarding-admin.dto";
import { UpsertCompanyProfileDto } from "../application/dtos/upsert-company-profile.dto";
import { CreateOnboardingAdminUseCase } from "../application/use-cases/create-onboarding-admin.use-case";
import { GetCompanyProfileUseCase } from "../application/use-cases/get-company-profile.use-case";
import { UpsertCompanyProfileUseCase } from "../application/use-cases/upsert-company-profile.use-case";

@Controller('onboarding')
export class OnboardingController {
    constructor(
        private readonly createOnboardingAdminUseCase: CreateOnboardingAdminUseCase,
        private readonly getCompanyProfileUseCase: GetCompanyProfileUseCase,
        private readonly upsertCompanyProfileUseCase: UpsertCompanyProfileUseCase,
        private readonly authService: AuthService,
        private readonly i18n: I18nService,
    ) { }

    /**
     * Sin AuthGuard a propósito: todavía no existe ningún usuario en el tenant
     * para tener sesión — el api_key en el body es la única credencial.
     */
    @Post('admin')
    async createAdmin(
        @Body() dto: CreateOnboardingAdminDto,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        try {
            await this.createOnboardingAdminUseCase.execute(dto);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error('Error creating onboarding admin:', error);
            throw new HttpException(this.i18n.t('onboarding.ADMIN_CREATE_FAILED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Reutiliza el login normal (misma resolución de api_key + emisión de
        // cookies) para que el admin recién creado quede logueado de una vez.
        const { user, access_token, refresh_token } = await this.authService.login({
            identifier: dto.username,
            password: dto.password,
            api_key: dto.api_key,
        });

        res.cookie('access_token', access_token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3 * 60 * 60 * 1000,
        });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return new ResponseDto({
            statusCode: HttpStatus.CREATED,
            message: this.i18n.t('onboarding.ADMIN_CREATED'),
            data: { user },
        });
    }

    @Get('company-profile')
    @ApiCookieAuth()
    @UseGuards(AuthGuard('jwt'), TenantResolutionGuard)
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
    @UseGuards(AuthGuard('jwt'), TenantResolutionGuard, RolesGuard)
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
