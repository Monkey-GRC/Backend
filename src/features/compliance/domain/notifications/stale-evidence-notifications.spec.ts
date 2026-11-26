import { staleDedupeSuffix, staleEvidenceEvents, STALE_GROUPED_ASSETS, type AutomaticReading } from './stale-evidence-notifications';

const NOW = new Date('2026-11-25T12:00:00Z');
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);
const reading = (over: Partial<AutomaticReading> = {}): AutomaticReading => ({ controlId: 'c1', assetId: 'a1', assetName: 'Servidor 1', executionId: 'e1', finishedAt: hoursAgo(30), ...over });

describe('staleEvidenceEvents (D153)', () => {
  it('avisa la lectura más vieja que PR-05 y no la fresca ni la que está justo en el límite', () => {
    const events = staleEvidenceEvents([reading(), reading({ assetId: 'a2', executionId: 'e2', finishedAt: hoursAgo(24) }), reading({ assetId: 'a3', executionId: 'e3', finishedAt: hoursAgo(2) })], NOW, 24);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: 'automatic_evidence_stale', controlId: 'c1', staleCount: 1, staleAssets: [{ name: 'Servidor 1', last_collected_at: hoursAgo(30).toISOString() }] });
  });

  it('un aviso por control, con sus activos del más viejo al más nuevo, hasta 5, y el total', () => {
    const readings = Array.from({ length: 7 }, (_, i) => reading({ assetId: `a${i}`, assetName: `S${i}`, executionId: `e${i}`, finishedAt: hoursAgo(25 + i) }));
    const [event] = staleEvidenceEvents([...readings, reading({ controlId: 'c2', assetId: 'x', executionId: 'ex' })], NOW, 24).filter((e) => e.controlId === 'c1');
    expect(event).toMatchObject({ staleCount: 7 });
    expect(event.type === 'automatic_evidence_stale' && event.staleAssets.map((a) => a.name)).toEqual(['S6', 'S5', 'S4', 'S3', 'S2'].slice(0, STALE_GROUPED_ASSETS));
    expect(staleEvidenceEvents([...readings, reading({ controlId: 'c2', assetId: 'x', executionId: 'ex' })], NOW, 24)).toHaveLength(2);
  });

  it('el mismo activo en dos pruebas del control cuenta una vez', () => {
    const [event] = staleEvidenceEvents([reading(), reading()], NOW, 24);
    expect(event).toMatchObject({ staleCount: 1 });
  });

  it('no se repite hasta una recolección nueva: la clave es la misma con las mismas recolecciones y cambia con otra', () => {
    const first = staleEvidenceEvents([reading()], NOW, 24)[0];
    const sameTomorrow = staleEvidenceEvents([reading()], new Date(NOW.getTime() + 86_400_000), 24)[0];
    expect(sameTomorrow.dedupeSuffix).toBe(first.dedupeSuffix);
    const fresher = staleEvidenceEvents([reading({ executionId: 'e9', finishedAt: hoursAgo(26) })], NOW, 24)[0];
    expect(fresher.dedupeSuffix).not.toBe(first.dedupeSuffix);
  });

  it('la clave es corta y no depende del orden de los ids', () => {
    const ids = Array.from({ length: 50 }, (_, i) => `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`);
    expect(staleDedupeSuffix(ids)).toBe(staleDedupeSuffix([...ids].reverse()));
    expect(staleDedupeSuffix(ids)).toHaveLength(24);
  });

  it('sin lecturas desactualizadas no hay avisos', () => {
    expect(staleEvidenceEvents([reading({ finishedAt: hoursAgo(1) })], NOW, 24)).toEqual([]);
  });
});
