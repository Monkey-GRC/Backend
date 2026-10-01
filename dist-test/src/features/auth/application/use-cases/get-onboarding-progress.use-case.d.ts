import { UserRole } from '../../../../common/enums/user-role.enum';
import { OnboardingProgressReader } from '../../domain/ports/onboarding-progress.reader';
export type OnboardingStep = 'organizational_context' | 'service_context' | 'technical_control';
export type OnboardingProgress = {
    next_step: OnboardingStep | null;
    completed_steps: OnboardingStep[];
};
export declare class GetOnboardingProgressUseCase {
    private readonly progress;
    constructor(progress: OnboardingProgressReader);
    execute(user: {
        id: string;
        companyId: string;
        role: UserRole;
    }): Promise<OnboardingProgress | null>;
}
