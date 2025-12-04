// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
    sub: string;            // user.id
    email: string;
    role: string;
    client_id?: string | null;
    is_active: boolean;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || '',
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload) {
        // Lo que retornes queda en req.user
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            client_id: payload.client_id ?? null,
            is_active: payload.is_active,
        };
    }
}
