import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ACTIVATION_CODE_TTL_HOURS } from './application/activation-policy.token';
import { InvitationDelivery } from './application/invitation/invitation-delivery.service';
import { SetControlExecutorUseCase, SetControlOwnerUseCase } from './application/use-cases/team-assignments.use-cases';
import { CreateGroupUseCase, ListGroupsUseCase, RenameGroupUseCase } from './application/use-cases/team-groups.use-cases';
import { CreateTeamMemberUseCase, IssueActivationCode, ListTeamUseCase, ReissueActivationCodeUseCase, UpdateTeamMemberUseCase } from './application/use-cases/team-users.use-cases';
import { TeamAssignmentRepository } from './domain/repositories/team-assignment.repository';
import { TeamGroupRepository } from './domain/repositories/team-group.repository';
import { TeamUserRepository } from './domain/repositories/team-user.repository';
import { TeamAssignmentPrismaRepository } from './infrastructure/repositories/team-assignment.prisma.repository';
import { TeamUserPrismaRepository } from './infrastructure/repositories/team-user.prisma.repository';
import { TeamGroupPrismaRepository } from './infrastructure/repositories/team-group.prisma.repository';
import { AssignmentsController } from './presentation/assignments.controller';
import { GroupsController } from './presentation/groups.controller';
import { UsersController } from './presentation/users.controller';

// El equipo de la empresa (contracts/gestion-usuarios.md, D102).
@Module({
  controllers: [UsersController, GroupsController, AssignmentsController],
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
    { provide: TeamGroupRepository, useClass: TeamGroupPrismaRepository },
    { provide: TeamAssignmentRepository, useClass: TeamAssignmentPrismaRepository },
    SetControlOwnerUseCase,
    SetControlExecutorUseCase,
    IssueActivationCode,
    InvitationDelivery,
    CreateTeamMemberUseCase,
    ListTeamUseCase,
    UpdateTeamMemberUseCase,
    ReissueActivationCodeUseCase,
    ListGroupsUseCase,
    CreateGroupUseCase,
    RenameGroupUseCase,
  ],
})
export class TeamModule {}
