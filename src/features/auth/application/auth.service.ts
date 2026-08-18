import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { Role } from 'src/common/enums/role.enum';
import { RequestContext } from 'src/common/utils/request-context';
import { LoginDto } from './dtos/login.dto';

type JwtPayload = {
    sub: string;
    email: string;
    role: string;
    client_id: string | null;
    is_active: boolean;
    jti?: string;
};

type AuthenticatedUser = {
    id: string;
    email: string;
    username: string;
    name: string | null;
    last_name: string | null;
    role: string;
    password: string;
    is_active: boolean;
};

@Injectable()
export class AuthService {
    constructor(
        private readonly centralPrisma: CentralPrismaService,
        private readonly tenantConnection: TenantConnectionManager,
        private readonly jwt: JwtService,
    ) { }

    private now() { return new Date(); }

    private secondsFromNow(sec: number) {
        return new Date(this.now().getTime() + sec * 1000);
    }

    private async signAccessToken(payloadBase: Omit<JwtPayload, 'jti'>, expiresInSec: number) {
        const token = await this.jwt.signAsync(payloadBase, {
            secret: process.env.JWT_SECRET!,
            expiresIn: expiresInSec,
        });
        return {
            token,
            expiresAt: this.secondsFromNow(expiresInSec),
        };
    }

    private async signRefreshToken(payloadBase: Omit<JwtPayload, 'jti'>, expiresInSec: number) {
        const jti = crypto.randomUUID();
        const token = await this.jwt.signAsync({ ...payloadBase, jti }, {
            secret: process.env.JWT_REFRESH_SECRET!,
            expiresIn: expiresInSec,
        });
        return { token, jti, expiresAt: this.secondsFromNow(expiresInSec) };
    }

    /** Resuelve el "db handle" (central o de un tenant) a partir de un client_id de JWT/payload. */
    private async dbFor(clientId: string | null): Promise<any> {
        if (!clientId) return this.centralPrisma;
        return this.tenantConnection.getClientFor(clientId);
    }

    private async storeRefreshToken(db: any, userId: string, refreshToken: string, expiresAt: Date) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await db.user.update({
            where: { id: userId },
            data: {
                refresh_token_hash: hash,
                refresh_token_expires_at: expiresAt,
            },
        });
    }

    private async validateRefreshToken(db: any, userId: string, providedToken: string) {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user || !user.refresh_token_hash) return false;
        if (!user.refresh_token_expires_at || user.refresh_token_expires_at < this.now()) return false;
        return bcrypt.compare(providedToken, user.refresh_token_hash);
    }

    private async findUserByIdentifier(db: any, identifier: string): Promise<AuthenticatedUser | null> {
        const user = await db.user.findFirst({
            where: {
                OR: [
                    { email: identifier.toLowerCase() },
                    { username: identifier },
                ],
            },
        });
        return user as AuthenticatedUser | null;
    }

    /**
     * Público a propósito: lo reutiliza el onboarding para dejar logueado al
     * admin recién creado, sin pasar por login() (que ahora depende de que
     * ya existan los headers mnk-client-identifier/mnk-client-key, los
     * cuales todavía no existen en ese punto exacto del flujo).
     */
    async issueTokens(user: AuthenticatedUser, clientId: string | null, db: any) {
        const basePayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            client_id: clientId,
            is_active: user.is_active,
        };

        const accessSecs = Number(process.env.JWT_EXPIRES_IN ?? 120 * 60);
        const refreshSecs = Number(process.env.JWT_REFRESH_EXPIRES_IN ?? 30 * 24 * 60 * 60);

        const access = await this.signAccessToken(basePayload, accessSecs);
        const refresh = await this.signRefreshToken(basePayload, refreshSecs);

        await this.storeRefreshToken(db, user.id, refresh.token, refresh.expiresAt);

        return {
            access_token: access.token,
            access_token_expires_at: access.expiresAt.toISOString(),
            refresh_token: refresh.token,
            refresh_token_expires_at: refresh.expiresAt.toISOString(),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                last_name: user.last_name,
                role: user.role,
                client_id: clientId,
                is_active: user.is_active,
            },
        };
    }

    private async loginMonkeyAdmin(dto: LoginDto) {
        const user = await this.findUserByIdentifier(this.centralPrisma, dto.identifier);
        if (!user || !user.is_active || user.role !== Role.MONKEY_ADMIN) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const ok = await bcrypt.compare(dto.password, user.password);
        if (!ok) throw new UnauthorizedException('Credenciales inválidas');

        return this.issueTokens(user, null, this.centralPrisma);
    }

    private async loginTenant(dto: LoginDto, clientId: string) {
        const tenantDb = await this.tenantConnection.getClientFor(clientId);
        const user = await this.findUserByIdentifier(tenantDb, dto.identifier);
        if (!user || !user.is_active) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const ok = await bcrypt.compare(dto.password, user.password);
        if (!ok) throw new UnauthorizedException('Credenciales inválidas');

        return this.issueTokens(user, clientId, tenantDb);
    }

    /**
     * Resuelve a qué tenant pertenece un identifier consultando el
     * directorio central — es un simple directorio (email/username ->
     * client_id), no un mecanismo de seguridad: no prueba nada por sí solo,
     * solo evita depender de que el navegador ya tenga guardadas las keys
     * mnk-client-identifier/mnk-client-key para saber a qué base de datos
     * dirigir la verificación real de la contraseña.
     */
    private async resolveClientIdByIdentifier(identifier: string): Promise<string | null> {
        // Mismo criterio que findUserByIdentifier: el email se guarda/compara
        // en minúsculas, el username tal cual se escribió (case-sensitive).
        const entry = await this.centralPrisma.tenantIdentifierDirectory.findFirst({
            where: { OR: [{ identifier: identifier.toLowerCase() }, { identifier }] },
            select: { client_id: true },
        });
        return entry?.client_id ?? null;
    }

    /**
     * clientId puede venir ya resuelto por ClientCredentialsGuard (headers
     * mnk-client-identifier/mnk-client-key, para integraciones directas a la
     * API sin sesión de usuario). Si no vino así, se intenta resolver por el
     * directorio central a partir del identifier — así el login con
     * usuario/contraseña funciona desde cualquier dispositivo.
     */
    async login(dto: LoginDto) {
        const clientId = RequestContext.clientId ?? (await this.resolveClientIdByIdentifier(dto.identifier));
        return clientId ? this.loginTenant(dto, clientId) : this.loginMonkeyAdmin(dto);
    }

    async refresh(refreshToken: string) {
        let payload: JwtPayload;
        try {
            payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET!,
            });
        } catch {
            throw new UnauthorizedException('Refresh token inválido o expirado');
        }

        const db = await this.dbFor(payload.client_id);
        const ok = await this.validateRefreshToken(db, payload.sub, refreshToken);
        if (!ok) throw new ForbiddenException('Refresh token revocado o no coincide');

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

        await this.storeRefreshToken(db, payload.sub, refresh.token, refresh.expiresAt);

        return {
            access_token: access.token,
            access_token_expires_at: access.expiresAt.toISOString(),
            refresh_token: refresh.token,
            refresh_token_expires_at: refresh.expiresAt.toISOString(),
        };
    }

    async logout(userId: string, clientId: string | null) {
        const db = await this.dbFor(clientId);
        await db.user.update({
            where: { id: userId },
            data: { refresh_token_hash: null, refresh_token_expires_at: null },
        });
        return { ok: true };
    }
}
