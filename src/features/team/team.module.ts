import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ACTIVATION_CODE_TTL_HOURS } from './application/activation-policy.token';
import {
  ListControlResponsiblesUseCase,
  ListDimensionOwnersUseCase,
  SetControlResponsibleUseCase,
  SetDimensionOwnerUseCase,
} from './application/use-cases/responsibility.use-cases';
import { CreateTeamMemberUseCase, IssueActivationCode, ListTeamUseCase, ReissueActivationCodeUseCase, UpdateTeamMemberUseCase } from './application/use-cases/team-users.use-cases';
import { ResponsibilityRepository } from './domain/repositories/responsibility.repository';
import { TeamUserRepository } from './domain/repositories/team-user.repository';
import { ResponsibilityPrismaRepository } from './infrastructure/repositories/responsibility.prisma.repository';
import { TeamUserPrismaRepository } from './infrastructure/repositories/team-user.prisma.repository';
import { ResponsibilitiesController } from './presentation/responsibilities.controller';
import { UsersController } from './presentation/users.controller';

// El equipo de la empresa y el reparto del trabajo por dimensión (contracts/modules/users-team.md, D96).
@Module({
  controllers: [UsersController, ResponsibilitiesController],
  providers: [
    {
      provide: ACTIVATION_CODE_TTL_HOURS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): number => {
        const hours = Number(config.get<string>('ACTIVATION_CODE_TTL_HOURS') ?? '168');
        if (!Number.isInteger(hours) || hours <= 0) throw new Error('ACTIVATION_CODE_TTL_HOURS debe ser un entero > 0');
        return hours;
      },
    },
    { provide: TeamUserRepository, useClass: TeamUserPrismaRepository },
    { provide: ResponsibilityRepository, useClass: ResponsibilityPrismaRepository },
    IssueActivationCode,
    CreateTeamMemberUseCase,
    ListTeamUseCase,
    UpdateTeamMemberUseCase,
    ReissueActivationCodeUseCase,
    ListDimensionOwnersUseCase,
    SetDimensionOwnerUseCase,
    ListControlResponsiblesUseCase,
    SetControlResponsibleUseCase,
  ],
})
export class TeamModule {}
