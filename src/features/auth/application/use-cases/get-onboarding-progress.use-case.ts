import { Injectable } from '@nestjs/common';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { OnboardingProgressReader } from '../../domain/ports/onboarding-progress.reader';

export type OnboardingStep = 'organizational_context' | 'service_context' | 'technical_control';

export type OnboardingProgress = {
  next_step: OnboardingStep | null;
  completed_steps: OnboardingStep[];
};

// El onboarding es del cliente: solo el admin_empresa lo recorre. Para el resto no aplica (null).
//
// Hoy solo se puede derivar el Componente 1 (existe la organización). Los pasos 2 y 3 se suman a
// `completed_steps` cuando esos componentes existan (MD-78, MD-85); mientras tanto, terminado el 1,
// el siguiente es el 2.
@Injectable()
export class GetOnboardingProgressUseCase {
  constructor(private readonly progress: OnboardingProgressReader) {}

  async execute(user: {
    id: string;
    companyId: string;
    role: UserRole;
  }): Promise<OnboardingProgress | null> {
    if (user.role !== 'admin_empresa') return null;

    const scope = { companyId: user.companyId, userId: user.id, role: user.role };
    const completed: OnboardingStep[] = [];
    if (await this.progress.hasOrganizationalContext(scope)) completed.push('organizational_context');

    const all: OnboardingStep[] = ['organizational_context', 'service_context', 'technical_control'];
    return {
      next_step: all.find((step) => !completed.includes(step)) ?? null,
      completed_steps: completed,
    };
  }
}
