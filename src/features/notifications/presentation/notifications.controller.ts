import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req, Sse, type MessageEvent } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import type { Principal } from '../../../common/auth/principal';
import { AnyAuthenticated } from '../../../common/authorization/can.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { clientIp } from '../../../common/http/client-ip';
import { STREAM_PING_SECONDS } from '../../../common/notifications/notification-type';
import { toPageResponse } from '../../../common/pagination/page';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiPaged } from '../../../common/swagger/api-envelope';
import { digestHourUtc } from '../application/digest/digest-hour';
import { NotificationHub } from '../application/live/notification-hub';
import { ListNotificationsQuery, MarkNotificationDto, ReadAllNotificationsDto, UpdateNotificationPreferencesDto } from '../application/notification.dto';
import {
  GetNotificationPreferencesUseCase, ListNotificationsUseCase, MarkNotificationUseCase, ReadAllNotificationsUseCase, UnreadCountUseCase, UpdateNotificationPreferencesUseCase,
} from '../application/notification.use-cases';
import type { Language } from '../domain/notification';
import { toNotification, toPreferences, toStreamEvent } from './notification-response.mapper';
import { NotificationPreferencesResponse, NotificationResponse, ReadAllResponse, UnreadCountResponse } from './notifications.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const langOf = (): Language => (I18nContext.current()?.lang?.toLowerCase().startsWith('en') ? 'en' : 'es');
// 404 también cuando el id no es un UUID: no hay nada que encontrar.
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// La campana de cada persona (contracts/notificaciones.md, D143, D151, MD-515). Cualquier cuenta con sesión; todo es de quien llama, y el aviso de otra persona es 404 (SEG-87).
@ApiTags(API_TAGS.notifications)
@AnyAuthenticated()
@Controller('me')
export class NotificationsController {
  constructor(
    private readonly list: ListNotificationsUseCase,
    private readonly unread: UnreadCountUseCase,
    private readonly mark: MarkNotificationUseCase,
    private readonly readAll: ReadAllNotificationsUseCase,
    private readonly hub: NotificationHub,
  ) {}

  @ApiOperation({
    summary: 'Listar mis avisos',
    description:
      'Los avisos de la persona de los últimos 90 días (leídos y no leídos), del más reciente al más antiguo. Solo los suyos: el de otra persona no se ve ni para el `admin_empresa`. El texto va traducido según `Accept-Language`. Orden fijo, sin `sort`.',
  })
  @ApiPaged(NotificationResponse, 'Los avisos de la persona, paginados.')
  @Get('notifications')
  async listMine(@CurrentUser() p: Principal, @Query() q: ListNotificationsQuery) {
    const page = await this.list.execute(p, q, langOf());
    return new ResponseDto(HttpStatus.OK, t('notification.list'), toPageResponse(page, toNotification));
  }

  @ApiOperation({
    summary: 'Contador de la campana',
    description: 'Cuántos avisos sin leer tiene la persona. Es el respaldo del canal en vivo: la campana lo pide al cargar y mientras el canal está caído.',
  })
  @ApiData(UnreadCountResponse, 'El número de la campana.')
  @Get('notifications/unread-count')
  async unreadCount(@CurrentUser() p: Principal) {
    return new ResponseDto(HttpStatus.OK, t('notification.unread_count'), { unread_count: await this.unread.execute(p) });
  }

  @ApiOperation({
    summary: 'Canal en vivo de la campana (SSE)',
    description:
      'Server-Sent Events (`text/event-stream`) con la sesión por cookie, una conexión por pestaña. Eventos: `ready` `{ unread_count }` al abrir; `notification` `{ unread_count, notification }` cuando llega un aviso ya confirmado; ' +
      '`unread_count` `{ unread_count }` cuando otra pestaña marca leídos; `ping` `{}` cada 25 s. Al cerrar sesión el servidor cierra el canal. Hasta 5 conexiones abiertas por persona en cada instancia: al abrir una más, el servidor cierra la más antigua. Si el servidor pierde su conexión con la base y la recupera, manda `unread_count` a cada conexión abierta. El texto viaja en el idioma de la persona. No deja `audit_logs`.',
  })
  @ApiProduces('text/event-stream')
  @ApiResponse({ status: 200, description: 'La conexión queda abierta con los eventos `ready`, `notification`, `unread_count` y `ping`.', content: { 'text/event-stream': { schema: { type: 'string', example: 'event: ready\ndata: {"unread_count":3}\n\n' } } } })
  @Sse('notifications/stream')
  stream(@CurrentUser() p: Principal): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const emit = (type: string, data: unknown) => subscriber.next({ type, data: data as object });
      const ping = setInterval(() => emit('ping', {}), STREAM_PING_SECONDS * 1000);
      let opened: Awaited<ReturnType<NotificationHub['open']>> | null = null;
      let closed = false;
      this.hub
        .open(p, {
          send: (event) => {
            const { type, data } = toStreamEvent(event);
            emit(type, data);
          },
          close: () => subscriber.complete(),
        })
        .then((conn) => {
          opened = conn;
          // Si la persona se desconectó mientras se abría, la conexión no queda registrada.
          if (closed) this.hub.close(conn);
        })
        .catch((error: unknown) => subscriber.error(error));
      return () => {
        closed = true;
        clearInterval(ping);
        if (opened) this.hub.close(opened);
      };
    });
  }

  @ApiOperation({
    summary: 'Marcar un aviso como leído o no leído',
    description: 'Solo el destinatario; el aviso de otra persona, uno que no existe o uno de más de 90 días responde `404`. Idempotente: marcar leído uno ya leído no cambia su `read_at`. No deja `audit_logs`. Un aviso suelto no se borra.',
  })
  @ApiData(NotificationResponse, 'El aviso con su estado nuevo.')
  @Patch('notifications/:id')
  async markOne(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: MarkNotificationDto) {
    return new ResponseDto(HttpStatus.OK, t('notification.updated'), toNotification(await this.mark.execute(p, id, dto.is_read, langOf())));
  }

  @ApiOperation({
    summary: 'Marcar todos los avisos como leídos',
    description: 'Marca como leídos los avisos sin leer de la persona. Con `up_to` solo los creados hasta ese instante (el más nuevo que vio la persona), para no marcar uno que llegó mientras leía.',
  })
  @ApiData(ReadAllResponse, 'Cuántos avisos se marcaron.')
  @HttpCode(HttpStatus.OK)
  @Post('notifications/read-all')
  async readEverything(@CurrentUser() p: Principal, @Body() dto: ReadAllNotificationsDto) {
    const updated = await this.readAll.execute(p, dto.up_to ? new Date(dto.up_to) : null);
    return new ResponseDto(HttpStatus.OK, t('notification.read_all'), { updated_count: updated });
  }
}

// La preferencia de correo: solo el resumen diario se puede apagar; los avisos de la aplicación no (D143).
@ApiTags(API_TAGS.notifications)
@AnyAuthenticated()
@Controller('me/notification-preferences')
export class NotificationPreferencesController {
  constructor(
    private readonly get: GetNotificationPreferencesUseCase,
    private readonly update: UpdateNotificationPreferencesUseCase,
    private readonly config: ConfigService,
  ) {}

  // La hora ya se validó al arrancar (`NotificationScheduler`): aquí no puede ser inválida.
  private digestHour(): number {
    return digestHourUtc(this.config);
  }

  @ApiOperation({ summary: 'Mis preferencias de notificaciones', description: 'Si el resumen diario por correo está encendido y desde qué hora (UTC) sale. Los avisos de la aplicación no se apagan.' })
  @ApiData(NotificationPreferencesResponse, 'Las preferencias de la persona.')
  @Get()
  async preferences(@CurrentUser() p: Principal) {
    return new ResponseDto(HttpStatus.OK, t('notification.preferences'), toPreferences(await this.get.execute(p), this.digestHour()));
  }

  @ApiOperation({
    summary: 'Encender o apagar el resumen por correo',
    description: 'Enciende o apaga el resumen diario por correo de quien llama; la campana sigue igual. Si cambia, deja `user.notification_preferences_changed` en `audit_logs` (antes y después). Un resumen ya enviado ese día no se retira.',
  })
  @ApiData(NotificationPreferencesResponse, 'Las preferencias ya actualizadas.')
  @Patch()
  async setPreferences(@CurrentUser() p: Principal, @Body() dto: UpdateNotificationPreferencesDto, @Req() req: Request) {
    const done = await this.update.execute(p, dto.is_email_digest_enabled, { ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });
    return new ResponseDto(HttpStatus.OK, t('notification.preferences_updated'), toPreferences(done, this.digestHour()));
  }
}
