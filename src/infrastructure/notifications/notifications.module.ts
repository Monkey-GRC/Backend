import { Global, Module } from '@nestjs/common';
import { NotificationEmitter } from '../../common/notifications/notification-emitter';
import { PrismaNotificationEmitter } from './prisma-notification.emitter';

// MD-515 · El puerto de emisión de avisos, disponible para los repositorios de cualquier feature (los que escriben el hecho que causa el aviso).
@Global()
@Module({
  providers: [{ provide: NotificationEmitter, useClass: PrismaNotificationEmitter }],
  exports: [NotificationEmitter],
})
export class NotificationEmitterModule {}
