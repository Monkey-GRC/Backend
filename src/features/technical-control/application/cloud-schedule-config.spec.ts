import { cloudScheduleSettings } from './cloud-schedule-config';

describe('cloudScheduleSettings (D158)', () => {
  const server = { probeMode: 'runner', runnerPool: 'default' };

  it('en el servidor se enciende sola, cada 5 minutos', () => {
    expect(cloudScheduleSettings(server)).toEqual({ enabled: true, intervalMinutes: 5 });
  });

  it('0 la apaga y un número cambia cada cuánto revisa', () => {
    expect(cloudScheduleSettings({ ...server, interval: '0' }).enabled).toBe(false);
    expect(cloudScheduleSettings({ ...server, interval: '2' })).toEqual({ enabled: true, intervalMinutes: 2 });
  });

  it('un backend local con grupo propio no se la lleva, salvo que lo pida', () => {
    expect(cloudScheduleSettings({ probeMode: 'runner', runnerPool: 'local-rod' }).enabled).toBe(false);
    expect(cloudScheduleSettings({ probeMode: 'runner', runnerPool: 'local-rod', interval: '1' }).enabled).toBe(true);
  });

  it('sin evaluación real no se programa nada, y un valor ilegible no cambia el comportamiento', () => {
    for (const probeMode of [undefined, '', 'simulated', 'unavailable']) expect(cloudScheduleSettings({ ...server, probeMode, interval: '1' }).enabled).toBe(false);
    expect(cloudScheduleSettings({ ...server, interval: 'pronto' }).enabled).toBe(true);
  });
});
