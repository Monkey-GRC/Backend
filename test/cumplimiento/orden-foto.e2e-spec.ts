import type { INestApplication } from '@nestjs/common';
import { BOOK_PARAMETERS } from '../../src/common/evaluation-parameters/parameters.fixtures';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { readControl, ReadoutControl } from '../../src/features/compliance/domain/controls/control-readout';
import { loadServiceSnapshot } from '../../src/features/compliance/infrastructure/shared/service-snapshot.loader';
import { bootApp } from '../support/app';
import { definirPeriodo, dosEmpresas, Tenant } from '../support/escenario';

// MD-501 · El estado de un control no depende del orden en que la foto del servicio trae los controles (hay un ciclo de Dependencias en el catálogo: VUL-1 <-> VUL-2).
let app: INestApplication;
let a: Tenant;

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
  // Con un período abierto las ventanas cerradas sin evidencia hacen visible la diferencia entre Vencido y Pendiente.
  const year = new Date().getUTCFullYear();
  await definirPeriodo(a.serviceId, `${year - 1}-01-01`, `${year + 1}-12-31`);
});
afterAll(async () => {
  await app?.close();
});

// Esta prueba FALLA con el motor anterior al D163 (8 diferencias: VUL-1 daba Vencido o Pendiente según por dónde entrara el ciclo).
describe('la foto de un servicio real', () => {
  it('las pruebas del ciclo comparten estado y permutar o invertir los controles no cambia el de ninguno', async () => {
    const snapshot = await app.get(PrismaService).withScope({ companyId: a.companyId }, (tx) => loadServiceSnapshot(tx, a.serviceId, BOOK_PARAMETERS));
    expect(snapshot.controls.length).toBeGreaterThan(50);
    const readAll = (controls: ReadoutControl[]) => {
      const data = { ...snapshot, controls };
      // Se lee en el orden recibido: así también cambia por dónde entra cada ciclo.
      const byControl: Record<string, unknown> = {};
      const byTest: Record<string, string> = {};
      for (const c of controls) {
        const r = readControl(c, data);
        byControl[r.control.catalogCode ?? r.control.ownCode] = [r.state, r.level, r.requirements.map((q) => q.tests.map((t) => t.status))];
        for (const q of r.requirements) for (const t of q.tests) byTest[t.test.code] = t.status;
      }
      return { byControl, byTest };
    };
    const baseline = readAll(snapshot.controls);
    const cycle = ['T-VUL-1-07', 'T-VUL-2-04', 'T-VUL-2-06'].map((code) => baseline.byTest[code]);
    expect(cycle.every((status) => status !== undefined)).toBe(true);
    expect(new Set(cycle).size).toBe(1);
    const reversed = [...snapshot.controls].reverse();
    const rotated = [...snapshot.controls.slice(37), ...snapshot.controls.slice(0, 37)];
    const interleaved = [...snapshot.controls.filter((_, i) => i % 2 === 0), ...snapshot.controls.filter((_, i) => i % 2 === 1)].reverse();
    for (const order of [reversed, rotated, interleaved]) expect(readAll(order)).toEqual(baseline);
  });
});
