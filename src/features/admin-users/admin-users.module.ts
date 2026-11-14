import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ADMIN_ACTIVATION_CODE_TTL_HOURS, IssueAdminActivationCode } from './application/admin-activation-code';
import { AdminInvitationDelivery } from './application/admin-invitation-delivery.service';
import { AdminStepUp, DeactivateAdminUseCase, InviteAdminUseCase, ListAdminsUseCase, ReactivateAdminUseCase, ReissueAdminCodeUseCase } from './application/use-cases/admin-accounts.use-cases';
import { PurgeExpiredAdminsUseCase } from './application/use-cases/purge-expired-admins.use-case';
import { AdminAccountRepository } from './domain/repositories/admin-account.repository';
import { AdminAccountPrismaRepository } from './infrastructure/admin-account.prisma.repository';
import { AdminPurgeScheduler } from './infrastructure/admin-purge.scheduler';
import { AdminsController } from './presentation/admins.controller';

// Cuentas de administrador de Monkey (contracts/gestion-usuarios/administradores.md, D117).
@Module({
  imports: [AuthModule],
  controllers: [AdminsController],
  providers: [
    {
      provide: ADMIN_ACTIVATION_CODE_TTL_HOURS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): number => {
        const hours = Number(config.get<string>('ACTIVATION_CODE_TTL_HOURS') ?? '168');
        if (!Number.isInteger(hours) || hours <= 0) throw new Error('ACTIVATION_CODE_TTL_HOURS debe ser un entero > 0');
        return hours;
      },
    },
    { provide: AdminAccountRepository, useClass: AdminAccountPrismaRepository },
    IssueAdminActivationCode,
    AdminInvitationDelivery,
    AdminStepUp,
    ListAdminsUseCase,
    InviteAdminUseCase,
    ReissueAdminCodeUseCase,
    DeactivateAdminUseCase,
    ReactivateAdminUseCase,
    PurgeExpiredAdminsUseCase,
    AdminPurgeScheduler,
  ],
})
export class AdminUsersModule {}
