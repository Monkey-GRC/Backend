import { isServiceNotice, type NotificationParams, type PartyParam, type ServiceNoticeParams } from '../../../common/notifications/notification-draft';
import type { NotificationType } from '../../../common/notifications/notification-type';
import type { Language } from './notification';

// D151 · El texto de un aviso se arma al LEER, con los datos guardados (`params`) y la plantilla de 7 campos (i18n `notification.types.<type>.*`). Función pura: quien la llama le da cómo
// traducir una clave. Nunca nombra al proveedor de la sonda ni del motor de nube, ni lleva códigos de prueba: los datos que recibe ya vienen limpios (SEG-39, D70).
export type Translate = (key: string, args?: Record<string, string | number>) => string;

export const DETAIL_FIELDS = ['what_happened', 'why_it_matters', 'how_to_fix', 'who', 'time_needed', 'evidence', 'impact'] as const;
export type DetailField = (typeof DETAIL_FIELDS)[number];
export type NotificationText = { title: string; detail: Record<DetailField, string | null> };

const MS_DAY = 86_400_000;
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `YYYY-MM-DD` → «dd/mm/aaaa» (es) o «Nov 24, 2026» (en). */
export function formatDay(day: string, lang: Language): string {
  const [y, m, d] = day.split('-').map(Number);
  if (lang === 'en') return `${MONTHS_EN[m - 1]} ${d}, ${y}`;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

/** Días de `today` a `day` (ambos `YYYY-MM-DD`, UTC); negativo si ya pasó. */
export const daysUntil = (day: string, today: string): number => Math.round((Date.parse(day) - Date.parse(today)) / MS_DAY);

// Un campo vacío o sin traducción no se muestra (la pantalla omite los `null`): una clave que vuelve igual a sí misma es una clave que no existe.
const text = (t: Translate, key: string, args?: Record<string, string | number>): string | null => {
  const value = t(key, args);
  return value && value !== key && value.trim() !== '' ? value : null;
};

function partyLabel(t: Translate, party: PartyParam | null): string {
  if (!party) return t('notification.party.unassigned');
  const role = text(t, `notification.roles.${party.role}`) ?? party.role;
  return party.name ? `${party.name} (${role})` : role;
}

/**
 * Título y los 7 campos del aviso. `today` (`YYYY-MM-DD`, UTC) es el «ahora» con que se cuenta el tiempo que queda: el aviso no guarda ese número porque cambia cada día.
 * El ejecutor es el del control y, si es nulo, ejecuta el dueño (D151).
 */
export function buildNotificationText(input: { type: NotificationType; params: NotificationParams & Record<string, unknown>; dueAt: string | null; today: string; lang: Language }, t: Translate): NotificationText {
  const { type, params, dueAt, today, lang } = input;
  if (isServiceNotice(params)) return buildGroupedText(type, params, t);
  const codes = Array.isArray(params.requirement_codes) ? params.requirement_codes : [];
  const code = params.control_code ?? '';
  const owner = params.owner ?? null;
  const executor = params.executor ?? owner;
  const args: Record<string, string | number> = {
    control_code: code,
    control_name: params.control_name ?? '',
    control_label: codes.length ? `${code} (${codes.join(', ')})` : code,
    requirement_codes: codes.join(', '),
    service_name: params.service_name ?? '',
    periodicity: params.periodicity ? (text(t, `notification.periodicity.${params.periodicity}`) ?? params.periodicity) : '',
    due_date: dueAt ? formatDay(dueAt, lang) : '',
    days_left: dueAt ? Math.max(daysUntil(dueAt, today), 0) : 0,
    owner: partyLabel(t, owner),
    executor: partyLabel(t, executor),
    actor: params.actor ? partyLabel(t, params.actor) : t('notification.party.someone'),
    assignee_role: params.assignee_role ? t(`notification.assignee_role.${params.assignee_role}`) : '',
    assignee_duty: params.assignee_role ? t(`notification.assignee_duty.${params.assignee_role}`) : '',
    // Reservados (MD-506, DT-83): los emisores de documentos y de la plataforma traen estos datos en su `params`.
    document_name: typeof params['document_name'] === 'string' ? params['document_name'] : '',
    company_name: typeof params['company_name'] === 'string' ? params['company_name'] : '',
  };
  const base = `notification.types.${type}`;
  const detail = {} as Record<DetailField, string | null>;
  for (const field of DETAIL_FIELDS) {
    // «Cuánto tiempo»: el que queda hasta el cierre (D151), con su singular y el día del cierre.
    let key = `${base}.${field}`;
    if (field === 'time_needed' && type === 'window_due_soon' && dueAt) {
      const left = daysUntil(dueAt, today);
      if (left <= 0) key = `${base}.time_needed_today`;
      else if (left === 1) key = `${base}.time_needed_one`;
    }
    detail[field] = text(t, key, args);
  }
  return { title: t(`${base}.title`, args), detail };
}

/**
 * Los controles «Sin asignar» de un servicio, agrupados (un aviso por administrador, servicio, tipo y día): título con la cantidad y los 7 campos con los códigos de hasta 5 controles y «y N más».
 * Plantilla en `notification.types.<type>.grouped.*`.
 */
function buildGroupedText(type: NotificationType, params: ServiceNoticeParams, t: Translate): NotificationText {
  const more = Math.max(params.control_count - params.control_codes.length, 0);
  const list = params.control_codes.join(', ') + (more > 0 ? ` ${t('notification.grouped.more', { more })}` : '');
  const args: Record<string, string | number> = { control_count: params.control_count, control_list: list, service_name: params.service_name };
  const base = `notification.types.${type}.grouped`;
  const detail = {} as Record<DetailField, string | null>;
  for (const field of DETAIL_FIELDS) detail[field] = text(t, `${base}.${field}`, args);
  return { title: t(`${base}.${params.control_count === 1 ? 'title_one' : 'title'}`, args), detail };
}
