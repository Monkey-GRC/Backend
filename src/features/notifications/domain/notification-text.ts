import { isParameterNotice, isServiceNotice, type ControlNoticeParams, type ParameterNoticeParams, type NotificationParams, type PartyParam, type ServiceNoticeParams } from '../../../common/notifications/notification-draft';
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

const MORE = (t: Translate, more: number) => (more > 0 ? ` ${t('notification.grouped.more', { more })}` : '');

// D153 · Los datos de los avisos de la evaluación automática: las verificaciones que pasaron a FAIL (hasta 5, en el idioma de quien lee) y los activos desactualizados con su última lectura.
function automaticArgs(params: ControlNoticeParams, lang: Language, t: Translate): Record<string, string | number> {
  const failures = params.failures ?? [];
  const stale = params.stale_assets ?? [];
  const failureCount = params.failure_count ?? failures.length;
  const staleCount = params.stale_count ?? stale.length;
  const untitled = t('notification.check_untitled');
  return {
    failure_count: failureCount,
    failure_list:
      failures.map((f) => `${f.asset_name}: ${(lang === 'es' ? (f.check_title_es ?? f.check_title_en) : (f.check_title_en ?? f.check_title_es)) ?? untitled}`).join('; ') + MORE(t, failureCount - failures.length),
    stale_count: staleCount,
    stale_list: stale.map((a) => `${a.name} (${t('notification.last_reading', { date: formatDay(a.last_collected_at.slice(0, 10), lang) })})`).join('; ') + MORE(t, staleCount - stale.length),
  };
}

/**
 * Título y los 7 campos del aviso. `today` (`YYYY-MM-DD`, UTC) es el «ahora» con que se cuenta el tiempo que queda: el aviso no guarda ese número porque cambia cada día.
 * El ejecutor es el del control y, si es nulo, ejecuta el dueño (D151).
 */
export function buildNotificationText(input: { type: NotificationType; params: NotificationParams & Record<string, unknown>; dueAt: string | null; today: string; lang: Language }, t: Translate): NotificationText {
  const { type, params, dueAt, today, lang } = input;
  if (isServiceNotice(params)) return buildGroupedText(type, params, t);
  if (isParameterNotice(params)) return buildParameterText(type, params, t);
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
    ...automaticArgs(params, lang, t),
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

// Un valor de parámetro como lo lee una persona: número tal cual, sí/no, la ventana en su idioma y, por periodicidad, «semanal: 2, mensual: 5».
function parameterValue(value: unknown, t: Translate): string {
  if (typeof value === 'boolean') return t(`notification.parameter_bool.${value}`);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return text(t, `notification.window_mode.${value}`) ?? value;
  if (value && typeof value === 'object') return Object.entries(value).map(([k, v]) => `${text(t, `notification.periodicity.${k}`) ?? k}: ${String(v)}`).join(', ');
  return String(value ?? '');
}

/** D153 · `check_parameters_changed`: nombre del parámetro (con su PR-n, del catálogo de parámetros), valor anterior y nuevo, y su efecto en la evaluación (su descripción). Plantilla en `notification.types.check_parameters_changed.*`. */
function buildParameterText(type: NotificationType, params: ParameterNoticeParams, t: Translate): NotificationText {
  const name = text(t, `evaluation_parameter.${params.parameter_key}.name`) ?? params.parameter_code ?? params.parameter_key;
  const args: Record<string, string | number> = {
    parameter_name: name,
    previous_value: parameterValue(params.previous_value, t),
    new_value: parameterValue(params.new_value, t),
    parameter_effect: text(t, `evaluation_parameter.${params.parameter_key}.description`) ?? '',
  };
  const base = `notification.types.${type}`;
  const detail = {} as Record<DetailField, string | null>;
  for (const field of DETAIL_FIELDS) detail[field] = text(t, `${base}.${field}`, args);
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
