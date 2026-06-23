import { Module } from "@nestjs/common";
import { AuthController } from "./presentation/auth.controller";
import { AuthService } from "./application/auth.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtService, JwtStrategy],
    exports: [JwtModule, PassportModule]
})
export class AuthModule { }
