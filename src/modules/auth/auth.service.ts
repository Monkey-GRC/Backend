// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { LoginDto } from './dtos/login.dto';

type JwtPayload = {
    sub: string;
    email: string;
    role: string;
    client_id?: string | null;
    is_active: boolean;
    jti?: string;
};

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) { }

    // === helpers =============================================================

    private now() { return new Date(); }

    private secondsFromNow(sec: number) {
        return new Date(this.now().getTime() + sec * 1000);
    }

    private async signAccessToken(payloadBase: Omit<JwtPayload, 'jti'>, expiresInSec: number) {
        const token = await this.jwt.signAsync(payloadBase, {
            secret: process.env.JWT_SECRET!,
            expiresIn: expiresInSec, // en segundos
        });
        return {
            token,
            expiresAt: this.secondsFromNow(expiresInSec),
        };
    }

    private async signRefreshToken(payloadBase: Omit<JwtPayload, 'jti'>, expiresInSec: number) {
        // jti para identificar el refresh (útil si usas lista blanca/negra)
        const jti = crypto.randomUUID();
        const token = await this.jwt.signAsync({ ...payloadBase, jti }, {
            secret: process.env.JWT_REFRESH_SECRET!,
            expiresIn: expiresInSec,
        });
        return { token, jti, expiresAt: this.secondsFromNow(expiresInSec) };
    }

    private async storeRefreshToken(userId: string, refreshToken: string, expiresAt: Date) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                refresh_token_hash: hash,
                refresh_token_expires_at: expiresAt,
            },
        });
    }

    private async validateRefreshToken(userId: string, providedToken: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.refresh_token_hash) return false;
        if (!user.refresh_token_expires_at || user.refresh_token_expires_at < this.now()) return false;
        const ok = await bcrypt.compare(providedToken, user.refresh_token_hash);
        return ok;
    }

    // === login / refresh =====================================================

    async validateUser(identifier: string, password: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier.toLowerCase() },
                    { username: identifier },
                ],
            },
        });
        if (!user || !user.is_active) return null;
        const ok = await bcrypt.compare(password, user.password);
        return ok ? user : null;
    }

    async login(dto: LoginDto) {
        const user = await this.validateUser(dto.identifier, dto.password);
        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        const basePayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            client_id: user.client_id,
            is_active: user.is_active,
        };

        const accessSecs = Number(process.env.JWT_EXPIRES_IN ?? 120 * 60);
        const refreshSecs = Number(process.env.JWT_REFRESH_EXPIRES_IN ?? 30 * 24 * 60 * 60);

        const access = await this.signAccessToken(basePayload, accessSecs);
        const refresh = await this.signRefreshToken(basePayload, refreshSecs);

        // Guardamos hash del refresh y su expiración
        await this.storeRefreshToken(user.id, refresh.token, refresh.expiresAt);

        return {
            access_token: access.token,
            access_token_expires_at: access.expiresAt.toISOString(), // 👈 fecha exacta
            refresh_token: refresh.token,
            refresh_token_expires_at: refresh.expiresAt.toISOString(),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                last_name: user.last_name,
                role: user.role,
                client_id: user.client_id,
                is_active: user.is_active,
            },
        };
    }

    async refresh(refreshToken: string) {
        // Verificamos firma y expiración del refresh
        let payload: JwtPayload;
        try {
            payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET!,
            });
        } catch {
            throw new UnauthorizedException('Refresh token inválido o expirado');
        }

        // Validar que el token coincide con el hash guardado y no expiró en BD
        const ok = await this.validateRefreshToken(payload.sub, refreshToken);
        if (!ok) throw new ForbiddenException('Refresh token revocado o no coincide');

        // Rotamos: emitimos refresh nuevo y reemplazamos el hash guardado
        const basePayload = {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
            client_id: payload.client_id,
            is_active: payload.is_active,
        };

        const accessSecs = Number(process.env.JWT_EXPIRES_IN ?? 120 * 60);
        const refreshSecs = Number(process.env.JWT_REFRESH_EXPIRES_IN ?? 30 * 24 * 60 * 60);

        const access = await this.signAccessToken(basePayload, accessSecs);
        const refresh = await this.signRefreshToken(basePayload, refreshSecs);

        await this.storeRefreshToken(payload.sub, refresh.token, refresh.expiresAt);

        return {
            access_token: access.token,
            access_token_expires_at: access.expiresAt.toISOString(),
            refresh_token: refresh.token,
            refresh_token_expires_at: refresh.expiresAt.toISOString(),
        };
    }

    async logout(userId: string) {
        // Revoca refresh actual
        await this.prisma.user.update({
            where: { id: userId },
            data: { refresh_token_hash: null, refresh_token_expires_at: null },
        });
        return { ok: true };
    }
}