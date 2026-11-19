import { Injectable } from '@nestjs/common';
import { UserRole } from '../../../../../common/enums/user-role.enum';
import type { OnboardingFlags } from '../../../domain/ports/current-user.reader';
import { OnboardingProgressReader } from '../../../domain/ports/onboarding-progress.reader';

export type OnboardingStep = 'organizational_context' | 'service_context' | 'technical_control';

export type OnboardingProgress = {
  next_step: OnboardingStep | null;
  completed_steps: OnboardingStep[];
};

// El onboarding es del cliente: solo el admin_empresa lo recorre. Para el resto no aplica (null).
//
// Se derivan de lo que existe en la base: el Componente 1 (existe la organización) y el 2 (existe al
// menos un servicio completo). El 3 se suma a `completed_steps` cuando exista (MD-85); mientras
// tanto, terminado el 2, el siguiente es el 3. Los pasos se recorren en orden: un servicio sin
// organización no cuenta (no puede existir, pero el orden es parte del contrato).
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
    if (await this.progress.hasOrganizationalContext(scope)) {
      completed.push('organizational_context');
      if (await this.progress.hasDeclaredService(scope)) {
        completed.push('service_context');
        if (await this.progress.hasTechnicalControl(scope)) completed.push('technical_control');
      }
    }
    return progressFrom(completed);
  }
}

// Pasos en orden: un servicio sin organización no cuenta.
export function progressFromFlags(flags: OnboardingFlags): OnboardingProgress {
  const completed: OnboardingStep[] = [];
  if (flags.organizationalContext) {
    completed.push('organizational_context');
    if (flags.declaredService) {
      completed.push('service_context');
      if (flags.technicalControl) completed.push('technical_control');
    }
  }
  return progressFrom(completed);
}

function progressFrom(completed: OnboardingStep[]): OnboardingProgress {
  const all: OnboardingStep[] = ['organizational_context', 'service_context', 'technical_control'];
  return {
    next_step: all.find((step) => !completed.includes(step)) ?? null,
    completed_steps: completed,
  };
}
