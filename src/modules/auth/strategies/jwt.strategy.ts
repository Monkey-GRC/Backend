// src/modules/auth/strategies/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

type JwtPayload = {
    sub: string;            // user.id
    email: string;
    role: string;
    client_id?: string | null;
    is_active: boolean;
};

/**
 * Extrae el JWT desde cookies httpOnly
 * NO usa Authorization header
 */
const cookieExtractor = (req: Request): string | null => {
    if (req && req.cookies && req.cookies.access_token) {
        return req.cookies.access_token;
    }
    return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: cookieExtractor, // 👈 CLAVE
            secretOrKey: process.env.JWT_SECRET || '',
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload) {
        // Lo que retornes queda disponible en req.user
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            client_id: payload.client_id ?? null,
            is_active: payload.is_active,
        };
    }
}
