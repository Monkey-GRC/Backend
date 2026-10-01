import { AuthUser } from '../domain/entities/auth-user.entity';
import { OnboardingProgress } from '../application/use-cases/get-onboarding-progress.use-case';
export declare function toAuthResponse(user: AuthUser, onboarding?: OnboardingProgress | null): {
    onboarding?: OnboardingProgress | undefined;
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
};
