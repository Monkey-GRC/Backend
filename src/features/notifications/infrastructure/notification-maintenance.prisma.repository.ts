import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { NotificationMaintenanceRepository } from '../domain/notification.repository';

@Injectable()
export class NotificationMaintenancePrismaRepository extends NotificationMaintenanceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  listCompanyIds(): Promise<string[]> {
    return this.prisma.withScope({ companyId: '', role: 'admin_monkey' }, async (tx) => (await tx.company.findMany({ where: { status: { not: 'deactivated' } }, select: { id: true }, orderBy: { id: 'asc' } })).map((c) => c.id));
  }

  // Los avisos son por persona (RLS) y ninguna política deja borrar: lo hace una función angosta de la base que solo borra lo de más de 90 días de la empresa.
  async purgeExpired(companyId: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ deleted: number }>>(Prisma.sql`SELECT platform.purge_expired_notifications(${companyId}::uuid) AS deleted`);
    return rows[0]?.deleted ?? 0;
  }

  deadSessions(companyId: string, sessionIds: readonly string[], now: Date, idleTimeoutSeconds: number): Promise<string[]> {
    if (sessionIds.length === 0) return Promise.resolve([]);
    return this.prisma.withScope({ companyId }, async (tx) => {
      const alive = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT s.id FROM platform.sessions s JOIN platform.users u ON u.id = s.user_id
         WHERE s.id = ANY(${[...sessionIds]}::uuid[]) AND s.revoked_at IS NULL AND s.expires_at > ${now}
           AND s.last_activity_at > ${new Date(now.getTime() - idleTimeoutSeconds * 1000)} AND u.status = 'active'`);
      const live = new Set(alive.map((s) => s.id));
      return sessionIds.filter((id) => !live.has(id));
    });
  }
}
