import { ApiProperty } from '@nestjs/swagger';
import { NOTIFICATION_TARGET_KINDS, NOTIFICATION_TYPES } from '../../../common/notifications/notification-type';

// Forma del `data` de los endpoints de Notificaciones (contracts/notificaciones.md), solo para la documentación (la arma `notification-response.mapper.ts`).
export class NotificationDetailResponse {
  @ApiProperty({ nullable: true, description: 'Qué pasó.' }) what_happened!: string | null;
  @ApiProperty({ nullable: true, description: 'Por qué importa.' }) why_it_matters!: string | null;
  @ApiProperty({ nullable: true, description: 'Cómo se corrige.' }) how_to_fix!: string | null;
  @ApiProperty({ nullable: true, description: 'Quién lo hace.' }) who!: string | null;
  @ApiProperty({ nullable: true, description: 'Cuánto tiempo toma: el que queda hasta el cierre de la ventana.' }) time_needed!: string | null;
  @ApiProperty({ nullable: true, description: 'Qué evidencia hace falta.' }) evidence!: string | null;
  @ApiProperty({ nullable: true, description: 'Qué impacto tiene.' }) impact!: string | null;
}

export class NotificationServiceResponse {
  @ApiProperty({ format: 'uuid', description: 'Identificador del servicio.' }) id!: string;
  @ApiProperty({ description: 'Nombre del servicio.' }) name!: string;
}

export class NotificationControlResponse {
  @ApiProperty({ format: 'uuid', description: 'Identificador del control del cliente.' }) id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'Código del control.' }) code!: string;
  @ApiProperty({ description: 'Nombre del control.' }) name!: string;
  @ApiProperty({ type: [String], example: ['CC6.1', 'CC6.2'], description: 'Códigos de los requisitos del marco que cubre el control. Nunca códigos de prueba.' }) requirement_codes!: string[];
}

export class NotificationGroupedControlResponse {
  @ApiProperty({ format: 'uuid', description: 'Identificador del control del cliente.' }) id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'Código del control.' }) code!: string;
}

export class NotificationTargetResponse {
  @ApiProperty({ enum: [...NOTIFICATION_TARGET_KINDS], enumName: 'NotificationTargetKind', description: 'A qué apunta el aviso (`notification_target_kind`): la pantalla arma el enlace; la API no conoce rutas del frontend.' }) kind!: string;
  @ApiProperty({ format: 'uuid', description: 'Identificador de lo que apunta.' }) id!: string;
  @ApiProperty({ format: 'uuid', nullable: true, description: 'El servicio al que pertenece, si aplica.' }) service_id!: string | null;
}

export class NotificationResponse {
  @ApiProperty({ format: 'uuid', description: 'Identificador del aviso.' }) id!: string;
  @ApiProperty({ enum: [...NOTIFICATION_TYPES], enumName: 'NotificationType', description: 'Tipo de aviso (`notification_type`).' }) type!: string;
  @ApiProperty({ description: '`true` si ya se marcó como leído.' }) is_read!: boolean;
  @ApiProperty({ nullable: true, example: null, description: 'Cuándo se leyó (ISO 8601 UTC); `null` si está sin leer.' }) read_at!: string | null;
  @ApiProperty({ example: '2026-12-16T12:00:05Z', description: 'Cuándo se creó el aviso (ISO 8601 UTC).' }) created_at!: string;
  @ApiProperty({ nullable: true, example: '2026-12-31', description: 'El cierre de la ventana (YYYY-MM-DD); `null` si no aplica.' }) due_at!: string | null;
  @ApiProperty({ description: 'Título ya traducido según `Accept-Language`; lleva el código del control.' }) title!: string;
  @ApiProperty({ type: NotificationDetailResponse, description: 'La plantilla de 7 campos, traducida; la pantalla omite los `null`.' }) detail!: NotificationDetailResponse;
  @ApiProperty({ type: NotificationServiceResponse, nullable: true, description: 'El servicio del aviso; `null` si no aplica.' }) service!: NotificationServiceResponse | null;
  @ApiProperty({ type: NotificationControlResponse, nullable: true, description: 'El control del aviso; `null` si no aplica.' }) control!: NotificationControlResponse | null;
  @ApiProperty({ type: [NotificationGroupedControlResponse], description: 'Solo en el aviso agrupado de controles «Sin asignar» (`target.kind = service`): hasta 5 controles con su id y código, para enlazarlos; `[]` en los demás. El total va en el título.' }) controls!: NotificationGroupedControlResponse[];
  @ApiProperty({ type: NotificationTargetResponse, description: 'A qué apunta el aviso.' }) target!: NotificationTargetResponse;
}

export class UnreadCountResponse {
  @ApiProperty({ example: 3, description: 'Cuántos avisos sin leer tiene la persona (de los últimos 90 días).' }) unread_count!: number;
}

export class ReadAllResponse {
  @ApiProperty({ example: 3, description: 'Cuántos avisos se marcaron como leídos.' }) updated_count!: number;
}

export class NotificationPreferencesResponse {
  @ApiProperty({ example: true, description: '`true` si recibe el resumen diario por correo.' }) is_email_digest_enabled!: boolean;
  @ApiProperty({ example: '12:00', description: 'La hora (UTC) desde la que sale el resumen diario.' }) email_digest_time_utc!: string;
}
