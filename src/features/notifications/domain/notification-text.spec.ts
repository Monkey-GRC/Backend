import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NotificationType as PrismaNotificationType } from '../../../../generated/prisma/enums';
import type { ControlNoticeParams } from '../../../common/notifications/notification-draft';
import { EMITTED_TYPES, NOTIFICATION_TYPES } from '../../../common/notifications/notification-type';
import { PROVIDER_PATTERN } from '../../../common/text/provider-names';
import type { Language } from './notification';
import { buildNotificationText, DETAIL_FIELDS, daysUntil, formatDay } from './notification-text';
import { I18N_FILES, translatorFor } from './notification-text.fixtures';

// MD-515 · D151 · El texto de cada aviso, completo en es y en, sin proveedor y sin códigos de prueba. Lee los archivos de i18n de verdad.
const FILES = I18N_FILES;
const translator = translatorFor;

const PARAMS: ControlNoticeParams & Record<string, unknown> = {
  control_code: 'IAC-12',
  control_name: 'Revisión de accesos privilegiados',
  requirement_codes: ['CC6.1', 'CC6.2'],
  service_id: '55aa',
  service_name: 'Plataforma de pagos',
  owner: { name: 'Laura Gómez', role: 'responsable' },
  executor: { name: 'Juan Pérez', role: 'delegado' },
  actor: { name: 'Ana Ruiz', role: 'admin_empresa' },
  periodicity: 'quarterly',
  assignee_role: 'executor',
  document_name: 'Política de accesos',
  company_name: 'Acme',
  failures: [{ asset_name: 'Cuenta de producción', check_title_en: 'Ensure MFA is enabled for the root account', check_title_es: 'Verifica que la cuenta raíz tenga MFA' }],
  failure_count: 1,
  stale_assets: [{ name: 'Servidor web 01', last_collected_at: '2026-12-10T08:30:00.000Z' }],
  stale_count: 1,
};

const PARAMETER_PARAMS = { parameter_key: 'freshness_hours', parameter_code: 'PR-05', previous_value: 24, new_value: 48 };

const build = (type: (typeof NOTIFICATION_TYPES)[number], lang: Language, over: Partial<{ dueAt: string | null; today: string; params: typeof PARAMS }> = {}) =>
  buildNotificationText({ type, params: over.params ?? (type === 'check_parameters_changed' ? (PARAMETER_PARAMS as unknown as typeof PARAMS) : PARAMS), dueAt: over.dueAt === undefined ? '2026-12-31' : over.dueAt, today: over.today ?? '2026-12-16', lang }, translator(lang));

describe.each(['es', 'en'] as const)('texto de los avisos (%s)', (lang) => {
  it.each([...NOTIFICATION_TYPES])('%s: título y los 7 campos, completos, sin llaves sin sustituir y sin proveedor', (type) => {
    const { title, detail } = build(type, lang);
    expect(title.trim()).not.toBe('');
    expect(title).not.toMatch(/^notification\./);
    for (const field of DETAIL_FIELDS) {
      expect(detail[field]).not.toBeNull();
      expect(detail[field]).not.toMatch(/^notification\./);
    }
    for (const value of [title, ...Object.values(detail)]) {
      expect(value).not.toMatch(/\{\w+\}/);
      expect(value).not.toMatch(PROVIDER_PATTERN);
    }
  });

  it('los tipos de control llevan el código del control en el título; los de documento y empresa, lo suyo', () => {
    for (const type of NOTIFICATION_TYPES) {
      const { title } = build(type, lang);
      if (type.startsWith('document_')) expect(title).toContain('Política de accesos');
      else if (type === 'company_purge_upcoming') expect(title).toContain('Acme');
      else if (type === 'check_parameters_changed') expect(title).toContain('PR-05');
      else expect(title).toContain('IAC-12');
    }
  });

  it('los emitidos hoy mencionan los requisitos del marco y nunca un código de prueba', () => {
    for (const type of EMITTED_TYPES.filter((x) => x !== 'check_parameters_changed')) {
      const { detail } = build(type, lang);
      expect(detail.what_happened).toContain('IAC-12 (CC6.1, CC6.2)');
      expect(JSON.stringify(detail)).not.toMatch(/T-\d|test_code/i);
    }
  });
});

describe('check_parameters_changed (D153)', () => {
  const textOf = (over: Record<string, unknown>, lang: Language) => build('check_parameters_changed', lang, { params: { ...PARAMETER_PARAMS, ...over } as unknown as typeof PARAMS });

  it('lleva PR-n y su nombre, el valor anterior, el nuevo y el efecto, sin proveedor', () => {
    const { title, detail } = textOf({}, 'es');
    expect(title).toBe('Cambió un parámetro de evaluación: Frescura de un resultado automático (PR-05)');
    expect(detail.what_happened).toContain('el valor anterior era 24 y el nuevo es 48');
    expect(detail.why_it_matters).not.toBe('');
    expect(JSON.stringify([title, detail])).not.toMatch(PROVIDER_PATTERN);
    expect(textOf({}, 'en').detail.what_happened).toContain('the previous value was 24 and the new one is 48');
  });

  it('formatea booleanos, ventanas y días por periodicidad', () => {
    expect(textOf({ parameter_key: 'impact_reduction_enabled', previous_value: false, new_value: true }, 'es').detail.what_happened).toContain('era desactivado y el nuevo es activado');
    expect(textOf({ parameter_key: 'validity_windows', previous_value: 'calendar', new_value: 'rolling' }, 'es').detail.what_happened).toContain('era por calendario y el nuevo es móvil');
    expect(textOf({ parameter_key: 'alert_days_before', previous_value: { weekly: 2 }, new_value: { weekly: 3, monthly: 5 } }, 'es').detail.what_happened).toContain('semanal: 3, mensual: 5');
  });
});

describe('evaluación automática (D153)', () => {
  const failures = Array.from({ length: 5 }, (_, i) => ({ asset_name: 'Servidor', check_title_en: `Check ${i}`, check_title_es: i === 0 ? null : `Verificación ${i}` }));

  it('direct_check_failed lista activo y verificación en el idioma de quien lee, con «y N más»', () => {
    const params = { ...PARAMS, failures, failure_count: 8 };
    const es = build('direct_check_failed', 'es', { params }).detail.what_happened;
    expect(es).toContain('8 verificaciones');
    expect(es).toContain('Servidor: Check 0; Servidor: Verificación 1');
    expect(es).toContain('y 3 más');
    expect(build('direct_check_failed', 'en', { params }).detail.what_happened).toContain('Servidor: Check 1');
  });

  it('un título nulo (nombraba al proveedor) sale genérico, nunca vacío', () => {
    const params = { ...PARAMS, failures: [{ asset_name: 'Servidor', check_title_en: null, check_title_es: null }], failure_count: 1 };
    expect(build('direct_check_failed', 'es', { params }).detail.what_happened).toContain('Servidor: una verificación del control');
  });

  it('automatic_evidence_stale dice cuándo fue la última lectura de cada activo', () => {
    const { detail } = build('automatic_evidence_stale', 'es', { params: { ...PARAMS, stale_count: 3 } });
    expect(detail.what_happened).toContain('Servidor web 01 (última lectura: 10/12/2026)');
    expect(detail.what_happened).toContain('y 2 más');
    expect(build('automatic_evidence_stale', 'en').detail.what_happened).toContain('Servidor web 01 (last reading: Dec 10, 2026)');
  });
});

describe('ventana por vencer · el tiempo que queda (D151)', () => {
  it('en el contrato de ejemplo: 15 días para el cierre del 31/12/2026', () => {
    const { title, detail } = build('window_due_soon', 'es');
    expect(title).toBe('IAC-12 · La ventana trimestral cierra el 31/12/2026 y falta evidencia');
    expect(detail.time_needed).toBe('Quedan 15 días para el cierre.');
    expect(detail.who).toBe('Ejecuta: Juan Pérez (delegado) · Dueño: Laura Gómez (responsable)');
  });

  it('el singular y el día del cierre', () => {
    expect(build('window_due_soon', 'es', { today: '2026-12-30' }).detail.time_needed).toBe('Queda 1 día para el cierre.');
    expect(build('window_due_soon', 'es', { today: '2026-12-31' }).detail.time_needed).toBe('La ventana cierra hoy.');
    expect(build('window_due_soon', 'en', { today: '2026-12-16' }).detail.time_needed).toBe('15 days left until it closes.');
  });

  it('sin ejecutor, ejecuta el dueño; sin dueño, «Sin asignar»', () => {
    expect(build('window_due_soon', 'es', { params: { ...PARAMS, executor: null } }).detail.who).toBe('Ejecuta: Laura Gómez (responsable) · Dueño: Laura Gómez (responsable)');
    expect(build('window_due_soon', 'es', { params: { ...PARAMS, executor: null, owner: null } }).detail.who).toBe('Ejecuta: Sin asignar · Dueño: Sin asignar');
  });

  it('una persona sin nombre sale solo con su papel', () => {
    expect(build('window_due_soon', 'en', { params: { ...PARAMS, owner: { name: null, role: 'responsable' } } }).detail.who).toBe('Executes: Juan Pérez (delegate) · Owner: responsible');
  });
});

describe.each(['window_due_soon', 'window_expired'] as const)('%s agrupado: controles «Sin asignar» de un servicio', (type) => {
  const group = (count: number, codes: string[]) => ({ service_id: '55aa', service_name: 'Plataforma de pagos', control_count: count, control_codes: codes });
  const textOf = (count: number, codes: string[], lang: Language) => buildNotificationText({ type, params: group(count, codes), dueAt: null, today: '2026-12-16', lang }, translatorFor(lang));

  it.each(['es', 'en'] as const)('(%s) título con la cantidad y los 7 campos con los códigos y «y N más», sin proveedor', (lang) => {
    const { title, detail } = textOf(12, ['IAC-01', 'IAC-02', 'IAC-03', 'IAC-04', 'IAC-05'], lang);
    expect(title).toContain('12');
    for (const field of DETAIL_FIELDS) expect(detail[field]).not.toBeNull();
    expect(detail.what_happened).toContain('IAC-01, IAC-02, IAC-03, IAC-04, IAC-05 ');
    expect(detail.what_happened).toContain(lang === 'es' ? 'y 7 más' : 'and 7 more');
    expect(detail.what_happened).toContain('Plataforma de pagos');
    for (const value of [title, ...Object.values(detail)]) {
      expect(value).not.toMatch(/\{\w+\}/);
      expect(value).not.toMatch(PROVIDER_PATTERN);
    }
  });

  it('en español: el título dice cuántos y el singular, sin «y N más» si caben todos', () => {
    expect(textOf(12, ['IAC-01'], 'es').title).toBe(type === 'window_due_soon' ? '12 controles sin asignar tienen ventanas por vencer' : '12 controles sin asignar tienen ventanas vencidas');
    const uno = textOf(1, ['IAC-01'], 'es');
    expect(uno.title).toBe(type === 'window_due_soon' ? '1 control sin asignar tiene una ventana por vencer' : '1 control sin asignar tiene una ventana vencida');
    expect(uno.detail.what_happened).not.toContain(' más');
  });
});

describe('fechas', () => {
  it('formatDay: dd/mm/aaaa en es y «Dec 31, 2026» en en', () => {
    expect(formatDay('2026-12-31', 'es')).toBe('31/12/2026');
    expect(formatDay('2026-01-05', 'es')).toBe('05/01/2026');
    expect(formatDay('2026-12-31', 'en')).toBe('Dec 31, 2026');
  });

  it('daysUntil cuenta días enteros en UTC, también negativos', () => {
    expect(daysUntil('2026-12-31', '2026-12-16')).toBe(15);
    expect(daysUntil('2026-12-31', '2027-01-02')).toBe(-2);
  });
});

describe('el catálogo de tipos', () => {
  it('es el mismo de la base (enum notification_type de Prisma)', () => {
    expect([...NOTIFICATION_TYPES].sort()).toEqual(Object.values(PrismaNotificationType).sort());
  });

  it('i18n tiene el mismo juego de llaves en es y en, y una etiqueta de catálogo por tipo', () => {
    const keys = (node: unknown, prefix = ''): string[] => (node && typeof node === 'object' ? Object.entries(node).flatMap(([k, v]) => keys(v, `${prefix}${k}.`)) : [prefix]);
    expect(keys(FILES.en).sort()).toEqual(keys(FILES.es).sort());
    for (const lang of ['es', 'en'] as const) {
      const catalogs = JSON.parse(readFileSync(join(process.cwd(), 'i18n', lang, 'catalogs.json'), 'utf8')) as { notification_type: Record<string, string> };
      expect(Object.keys(catalogs.notification_type).sort()).toEqual([...NOTIFICATION_TYPES].sort());
      for (const label of Object.values(catalogs.notification_type)) expect(label).not.toMatch(PROVIDER_PATTERN);
    }
  });
});
