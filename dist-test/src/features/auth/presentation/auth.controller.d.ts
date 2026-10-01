import type { Request, Response } from 'express';
import type { Principal } from '../../../common/auth/principal';
import { ResponseDto } from '../../../common/dtos/response.dto';
import type { SessionPolicy } from '../domain/entities/session.entity';
import { LoginDto } from '../application/dtos/login.dto';
import { RedeemAccessKeyDto } from '../application/dtos/redeem-access-key.dto';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user.use-case';
import { GetOnboardingProgressUseCase } from '../application/use-cases/get-onboarding-progress.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { RedeemAccessKeyUseCase } from '../application/use-cases/redeem-access-key.use-case';
import { RefreshSessionUseCase } from '../application/use-cases/refresh-session.use-case';
export declare class AuthController {
    private readonly login;
    private readonly refresh;
    private readonly logout;
    private readonly getCurrentUser;
    private readonly redeemAccessKey;
    private readonly getOnboardingProgress;
    private readonly policy;
    constructor(login: LoginUseCase, refresh: RefreshSessionUseCase, logout: LogoutUseCase, getCurrentUser: GetCurrentUserUseCase, redeemAccessKey: RedeemAccessKeyUseCase, getOnboardingProgress: GetOnboardingProgressUseCase, policy: SessionPolicy);
    signIn(dto: LoginDto, req: Request, res: Response): Promise<ResponseDto<{
        onboarding?: import("../application/use-cases/get-onboarding-progress.use-case").OnboardingProgress | undefined;
        user: {
            id: string;
            email: string;
            name: string;
            last_name: string;
            role: "admin_monkey" | "admin_empresa" | "funcional" | "auditor";
            status: "active" | "inactive" | "suspended";
            is_mfa_enabled: boolean;
            last_login_at: string | null;
            created_at: string;
        };
        company: {
            id: string;
            name: string;
        };
    }>>;
    redeem(dto: RedeemAccessKeyDto, req: Request, res: Response): Promise<ResponseDto<{
        onboarding?: import("../application/use-cases/get-onboarding-progress.use-case").OnboardingProgress | undefined;
        user: {
            id: string;
            email: string;
            name: string;
            last_name: string;
            role: "admin_monkey" | "admin_empresa" | "funcional" | "auditor";
            status: "active" | "inactive" | "suspended";
            is_mfa_enabled: boolean;
            last_login_at: string | null;
            created_at: string;
        };
        company: {
            id: string;
            name: string;
        };
    }>>;
    renew(req: Request, res: Response): Promise<ResponseDto<null>>;
    signOut(req: Request, res: Response): Promise<void>;
    me(principal: Principal): Promise<ResponseDto<{
        onboarding?: import("../application/use-cases/get-onboarding-progress.use-case").OnboardingProgress | undefined;
        user: {
            id: string;
            email: string;
            name: string;
            last_name: string;
            role: "admin_monkey" | "admin_empresa" | "funcional" | "auditor";
            status: "active" | "inactive" | "suspended";
            is_mfa_enabled: boolean;
            last_login_at: string | null;
            created_at: string;
        };
        company: {
            id: string;
            name: string;
        };
    }>>;
}
