import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

type JwtPayload = {
    sub: string;
    email: string;
    role: string;
    client_id?: string | null;
    is_active: boolean;
};

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
            jwtFromRequest: cookieExtractor,
            secretOrKey: process.env.JWT_SECRET || '',
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload) {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            client_id: payload.client_id ?? null,
            is_active: payload.is_active,
        };
    }
}
