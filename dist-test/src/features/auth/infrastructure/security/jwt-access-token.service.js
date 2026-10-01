"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAccessTokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_role_enum_1 = require("../../../../common/enums/user-role.enum");
const access_token_service_1 = require("../../domain/ports/access-token.service");
let JwtAccessTokenService = class JwtAccessTokenService extends access_token_service_1.AccessTokenService {
    jwt;
    constructor(jwt) {
        super();
        this.jwt = jwt;
    }
    sign(claims) {
        return this.jwt.signAsync({ ...claims });
    }
    async verify(token) {
        try {
            const payload = await this.jwt.verifyAsync(token, {
                algorithms: ['HS256'],
            });
            const { sub, cid, role, sid } = payload;
            if (!sub || !cid || !sid || !role || !user_role_enum_1.USER_ROLES.includes(role))
                return null;
            return { sub, cid, role, sid };
        }
        catch {
            return null;
        }
    }
};
exports.JwtAccessTokenService = JwtAccessTokenService;
exports.JwtAccessTokenService = JwtAccessTokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], JwtAccessTokenService);
//# sourceMappingURL=jwt-access-token.service.js.map