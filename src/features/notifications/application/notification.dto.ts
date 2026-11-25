import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsIn, IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';
import { NOTIFICATION_READ_FILTERS, NOTIFICATION_TYPES, type NotificationReadFilter, type NotificationType } from '../../../common/notifications/notification-type';

// contracts/notificaciones.md · Los nombres son los del contrato (snake_case).
export class ListNotificationsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: [...NOTIFICATION_READ_FILTERS], enumName: 'NotificationReadFilter', default: 'all', description: 'Filtra por lectura: todos, solo los no leídos o solo los leídos (`notification_read_filter`).' })
  @IsOptional() @IsIn([...NOTIFICATION_READ_FILTERS]) status: NotificationReadFilter = 'all';
  @ApiPropertyOptional({ enum: [...NOTIFICATION_TYPES], enumName: 'NotificationType', description: 'Solo los avisos de este tipo (`notification_type`).' })
  @IsOptional() @IsIn([...NOTIFICATION_TYPES]) type?: NotificationType;
}

export class MarkNotificationDto {
  @ApiProperty({ example: true, description: '`true` marca el aviso como leído; `false` lo vuelve a no leído.' }) @IsDefined() @IsBoolean() is_read!: boolean;
}

export class ReadAllNotificationsDto {
  @ApiPropertyOptional({ example: '2026-12-16T12:00:05Z', description: 'Solo marca los avisos creados hasta ese instante (el más nuevo que vio la persona), para no marcar uno que llegó mientras leía.' })
  @IsOptional() @IsISO8601() up_to?: string;
}

export class UpdateNotificationPreferencesDto {
  @ApiProperty({ example: false, description: '`false` apaga el resumen diario por correo; los avisos de la aplicación no se apagan.' }) @IsDefined() @IsBoolean() is_email_digest_enabled!: boolean;
}
