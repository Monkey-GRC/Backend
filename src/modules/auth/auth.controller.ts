// src/modules/auth/auth.controller.ts
import { Body, Controller, Post, UseGuards, Request, Delete, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResponseDto } from 'src/shared/dtos/response.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshDto } from './dtos/refresh-token.dto'
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly jwt: JwtService,
    ) { }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const data = await this.auth.login(dto);
        return new ResponseDto({
            status: 1,
            message: 'Usuario autenticado correctamente',
            data,
        });
    }

    @Post('refresh')
    async refresh(@Body() dto: RefreshDto) {          // 👈 await
        const data = await this.auth.refresh(dto.refresh_token);
        return new ResponseDto({
            status: 1,
            message: 'Token refrescado correctamente',
            data,
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('logout')
    @ApiBearerAuth()
    async logout(@Request() req: any) {
        const data = await this.auth.logout(req.user.id);
        return new ResponseDto({
            status: 1,
            message: 'Usuario deslogueado correctamente',
            data,
        });
    }

    // ✅ Nuevo endpoint: valida el token actual y devuelve info de expiración
    @UseGuards(AuthGuard('jwt'))
    @Get('validate')
    @ApiBearerAuth()
    validate(@Request() req: any, @Headers('authorization') authHeader?: string) {
        // extraer Bearer token del header
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring('Bearer '.length)
            : undefined;

        let exp: number | undefined;
        let iat: number | undefined;
        let expires_at: string | undefined;

        if (token) {
            const decoded: any = this.jwt.decode(token);
            exp = decoded?.exp;
            iat = decoded?.iat;
            if (typeof exp === 'number') {
                expires_at = new Date(exp * 1000).toISOString();
            }
        }

        return new ResponseDto({
            status: 1,
            message: 'Token válido',
            data: {
                user: req.user,
                iat,
                exp,
                expires_at,
            },
        });
    }
}
