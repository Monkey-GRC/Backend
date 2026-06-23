import { Body, Controller, Post, UseGuards, Request, Delete, Get, HttpStatus, Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import express from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly jwt: JwtService,
    ) { }

    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: express.Response
    ) {
        const { user, access_token, refresh_token } = await this.auth.login(dto);

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
            statusCode: HttpStatus.OK,
            message: 'Usuario autenticado correctamente',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    }

    @Post('refresh')
    async refresh(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response
    ) {
        const refreshToken = req.cookies?.refresh_token;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token no encontrado');
        }

        const { access_token } = await this.auth.refresh(refreshToken);

        res.cookie('access_token', access_token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000,
        });

        return new ResponseDto({
            statusCode: HttpStatus.OK,
            message: 'Token refrescado correctamente',
        });
    }

    @ApiCookieAuth()
    @UseGuards(AuthGuard('jwt'))
    @Delete('logout')
    async logout(
        @Req() req: any,
        @Res({ passthrough: true }) res: express.Response
    ) {
        await this.auth.logout(req.user.id);

        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        return new ResponseDto({
            statusCode: HttpStatus.OK,
            message: 'Sesión cerrada correctamente',
        });
    }

    @ApiCookieAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('validate')
    validate(@Request() req: any) {
        return new ResponseDto({
            statusCode: HttpStatus.OK,
            message: 'Token válido',
            data: {
                user: req.user,
            },
        });
    }
}
