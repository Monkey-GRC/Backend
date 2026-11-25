import type { I18nService } from 'nestjs-i18n';
import type { NotificationRecord } from '../domain/notification';
import { toNotification } from '../presentation/notification-response.mapper';
import { NotificationViewer } from './notification-view';

// MD-515: `controls` solo viene en el aviso agrupado de «Sin asignar»; los avisos emitidos antes no traen ids y devuelven `[]`.
const viewer = new NotificationViewer({ t: (key: string) => key } as unknown as I18nService);
const NOW = new Date('2026-12-16T12:00:00Z');

const record = (over: Partial<NotificationRecord>): NotificationRecord => ({
  id: 'n1',
  type: 'window_due_soon',
  targetKind: 'service',
  targetId: 's1',
  params: { service_id: 's1', service_name: 'Pagos', control_count: 2, control_codes: ['IAC-1', 'IAC-2'] },
  dueAt: null,
  readAt: null,
  createdAt: NOW,
  ...over,
});

describe('NotificationViewer · controls', () => {
  it('el aviso agrupado lleva los controles con su id y código', () => {
    const controls = [{ id: 'c1', code: 'IAC-1' }, { id: 'c2', code: 'IAC-2' }];
    const r = record({ params: { service_id: 's1', service_name: 'Pagos', control_count: 2, control_codes: ['IAC-1', 'IAC-2'], controls } });
    expect(toNotification(viewer.view(r, 'es', NOW)).controls).toEqual(controls);
  });

  it('un aviso agrupado emitido antes (sin ids) devuelve []', () => {
    expect(toNotification(viewer.view(record({}), 'es', NOW)).controls).toEqual([]);
  });

  it('un aviso de control devuelve []', () => {
    const r = record({
      targetKind: 'control',
      targetId: 'c1',
      dueAt: '2026-12-31',
      params: { control_code: 'IAC-1', control_name: 'Accesos', requirement_codes: [], service_id: 's1', service_name: 'Pagos', owner: null, executor: null, periodicity: 'monthly' },
    });
    expect(toNotification(viewer.view(r, 'es', NOW)).controls).toEqual([]);
  });
});
