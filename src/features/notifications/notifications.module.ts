import { Module } from '@nestjs/common';
import { NotificationHub } from './application/live/notification-hub';
import { PurgeExpiredNotificationsUseCase } from './application/digest/purge-notifications.use-case';
import { SendNotificationDigestsUseCase } from './application/digest/send-digests.use-case';
import { NotificationViewer } from './application/notification-view';
import {
  GetNotificationPreferencesUseCase, ListNotificationsUseCase, MarkNotificationUseCase, ReadAllNotificationsUseCase, UnreadCountUseCase, UpdateNotificationPreferencesUseCase,
} from './application/notification.use-cases';
import { NotificationDigestRepository, NotificationMaintenanceRepository, NotificationRepository } from './domain/notification.repository';
import { PgNotificationListener } from './infrastructure/live/pg-notification.listener';
import { NotificationDigestPrismaRepository } from './infrastructure/notification-digest.prisma.repository';
import { NotificationMaintenancePrismaRepository } from './infrastructure/notification-maintenance.prisma.repository';
import { NotificationPrismaRepository } from './infrastructure/notification.prisma.repository';
import { NotificationScheduler } from './infrastructure/notification.scheduler';
import { NotificationPreferencesController, NotificationsController } from './presentation/notifications.controller';

// MD-515 · D138, D143, D151 · La campana de cada persona, su preferencia de correo, el canal en vivo, el resumen diario y la retención. Los emisores no viven aquí: cada feature escribe su aviso
// en la transacción de su hecho por el puerto `NotificationEmitter` (`common/notifications`, adaptador en `infrastructure/notifications`).
@Module({
  controllers: [NotificationsController, NotificationPreferencesController],
  providers: [
    { provide: NotificationRepository, useClass: NotificationPrismaRepository },
    { provide: NotificationDigestRepository, useClass: NotificationDigestPrismaRepository },
    { provide: NotificationMaintenanceRepository, useClass: NotificationMaintenancePrismaRepository },
    NotificationViewer,
    NotificationHub,
    PgNotificationListener,
    NotificationScheduler,
    ListNotificationsUseCase,
    UnreadCountUseCase,
    MarkNotificationUseCase,
    ReadAllNotificationsUseCase,
    GetNotificationPreferencesUseCase,
    UpdateNotificationPreferencesUseCase,
    SendNotificationDigestsUseCase,
    PurgeExpiredNotificationsUseCase,
  ],
})
export class NotificationsModule {}
