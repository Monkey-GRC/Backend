import { buildClonePlan, CatalogSnapshot, CloneInput, controlTypeOf, NoTrustCriteriaError, planSize } from './clone-plan';

const SEC = 'tc-security';
const AVL = 'tc-availability';

// Dos requisitos (seguridad y disponibilidad), tres controles: K1 y K2 de seguridad, K3 solo de disponibilidad.
const catalog = (): CatalogSnapshot => ({
  requirements: [{ id: 'r-cc', trustCriterionId: SEC }, { id: 'r-a', trustCriterionId: AVL }],
  requirementControls: [
    { requirementId: 'r-cc', controlId: 'k1' },
    { requirementId: 'r-cc', controlId: 'k2' },
    { requirementId: 'r-a', controlId: 'k3' },
    { requirementId: 'r-a', controlId: 'k1' }, // un control en dos requisitos se clona una sola vez
  ],
  controls: [
    { id: 'k1', code: 'GOV-1', description: 'Descripción 1' },
    { id: 'k2', code: 'GOV-2', description: 'Descripción 2' },
    { id: 'k3', code: 'BCD-1', description: 'Descripción 3' },
    { id: 'k4', code: 'CPL-1', description: 'Sin punto de enfoque' },
  ],
  dimensions: [
    { controlId: 'k1', dimension: 'policy', type: 'manual', requiresProbe: false, requiresAi: true, requiresComplianceConfirmation: true, reasonNotApplicable: null },
    { controlId: 'k1', dimension: 'server', type: 'hybrid', requiresProbe: true, requiresAi: false, requiresComplianceConfirmation: true, reasonNotApplicable: null },
    { controlId: 'k2', dimension: 'policy', type: 'manual', requiresProbe: false, requiresAi: true, requiresComplianceConfirmation: true, reasonNotApplicable: null },
    { controlId: 'k3', dimension: 'policy', type: 'manual', requiresProbe: false, requiresAi: true, requiresComplianceConfirmation: true, reasonNotApplicable: null },
  ],
  controlTests: [{ controlId: 'k1', testId: 't1' }, { controlId: 'k1', testId: 't2' }, { controlId: 'k2', testId: 't1' }, { controlId: 'k3', testId: 't3' }],
  evidenceTemplates: [
    { controlId: 'k1', code: 'DOC-b', description: 'Segundo', dimension: 'policy', sequence: 2 },
    { controlId: 'k1', code: 'DOC-a', description: 'Primero', dimension: 'policy', sequence: 1 },
    { controlId: 'k3', code: 'DOC-a', description: 'Primero', dimension: 'policy', sequence: 1 },
  ],
  risks: [{ id: 'rk1', code: 'R001', name: 'Riesgo 1', description: 'd', trustCriterion: 'security', potentialImpact: ['x'], isActive: true }],
  causes: [
    { id: 'c1', code: 'F001', name: 'Causa 1', failureCategory: 'processes', description: 'd' },
    { id: 'c2', code: 'F002', name: 'Causa 2 (sin riesgo)', failureCategory: 'governance', description: 'd' },
  ],
  riskCauses: [{ riskId: 'rk1', causeId: 'c1' }],
  causeControls: [{ causeId: 'c1', controlId: 'k1' }, { causeId: 'c1', controlId: 'k3' }, { causeId: 'c2', controlId: 'k4' }],
});

const input = (over: Partial<CloneInput> = {}): CloneInput => ({
  tenantId: 'tenant-1',
  serviceId: 'svc-1',
  evaluationPeriod: '12 meses',
  contractedTrustCriterionIds: [SEC],
  catalog: catalog(),
  existing: { controls: new Map(), risks: new Map(), causes: new Map(), riskCauseKeys: new Set(), causeControlKeys: new Set() },
  ...over,
});

describe('buildClonePlan (MD-80)', () => {
  it('clona solo los controles de los criterios contratados', () => {
    const plan = buildClonePlan(input());
    expect(plan.clientControls.map((c) => c.ownCode)).toEqual(['GOV-1', 'GOV-2']);
  });

  it('con más criterios suma sus controles, y un control en dos requisitos se clona una vez', () => {
    const plan = buildClonePlan(input({ contractedTrustCriterionIds: [SEC, AVL] }));
    expect(plan.clientControls.map((c) => c.ownCode)).toEqual(['BCD-1', 'GOV-1', 'GOV-2']);
  });

  it('no clona un control sin punto de enfoque (CPL-1)', () => {
    expect(buildClonePlan(input({ contractedTrustCriterionIds: [SEC, AVL] })).clientControls.some((c) => c.ownCode === 'CPL-1')).toBe(false);
  });

  it('copia al control del cliente su plantilla, interpretación inicial y rastro de origen', () => {
    const [k1] = buildClonePlan(input()).clientControls;
    expect(k1).toMatchObject({ controlId: 'k1', clientInterpretation: 'Descripción 1', sourceRef: 'comite:GOV-1', isActive: true, tenantId: 'tenant-1', serviceId: 'svc-1' });
  });

  it('clona dimensiones y el vínculo con las pruebas, no las pruebas', () => {
    const plan = buildClonePlan(input());
    const k1 = plan.clientControls[0].id;
    expect(plan.clientControlDimensions.filter((d) => d.clientControlId === k1).map((d) => d.dimension)).toEqual(['policy', 'server']);
    expect(plan.clientControlTests.filter((t) => t.clientControlId === k1).map((t) => t.testId)).toEqual(['t1', 't2']);
  });

  it('el tipo del control es el de sus dimensiones, o hybrid si no coinciden', () => {
    const [k1, k2] = buildClonePlan(input()).clientControls;
    expect(k1.type).toBe('hybrid');
    expect(k2.type).toBe('manual');
    expect(controlTypeOf([])).toBe('manual');
    expect(controlTypeOf(['automated', 'automated'])).toBe('automated');
  });

  it('clona las evidencias en el orden del comité, con el periodo de evaluación y sin responsable', () => {
    const plan = buildClonePlan(input());
    const k1 = plan.clientControls[0].id;
    const ev = plan.evidenceRequirements.filter((e) => e.clientControlId === k1);
    expect(ev.map((e) => [e.code, e.sequence])).toEqual([['DOC-a', 1], ['DOC-b', 2]]);
    expect(ev[0]).toMatchObject({ validityWithinPeriod: '12 meses', responsibleId: null, sourceRef: 'DOC-a', dimension: 'policy' });
  });

  it('las plantillas llegan compartidas (sin prueba) y, si la asignación del catálogo ya nombra una prueba documental, el clon la conserva (D88)', () => {
    const snapshot = catalog();
    snapshot.evidenceTemplates = [
      { controlId: 'k1', code: 'DOC-a', description: 'Primero', dimension: 'policy', sequence: 1 },
      { controlId: 'k1', code: 'DOC-b', description: 'Segundo', dimension: 'policy', sequence: 2, testId: 't1' },
    ];
    const ev = buildClonePlan(input({ catalog: snapshot })).evidenceRequirements;
    expect(ev.map((e) => [e.code, e.testId])).toEqual([['DOC-a', null], ['DOC-b', 't1']]);
  });

  it('clona el set base completo de riesgos y causas, aunque la causa no tenga riesgo', () => {
    const plan = buildClonePlan(input());
    expect(plan.clientRisks.map((r) => r.code)).toEqual(['R001']);
    expect(plan.clientCauses.map((c) => c.code)).toEqual(['F001', 'F002']);
    expect(plan.clientRiskCauses).toHaveLength(1);
  });

  it('solo clona la arista causa→control si el control se clonó', () => {
    const plan = buildClonePlan(input()); // seguridad: k1 sí, k3 y k4 no
    const byId = new Map(plan.clientControls.map((c) => [c.id, c.ownCode]));
    expect(plan.clientCauseControls.map((e) => byId.get(e.clientControlId))).toEqual(['GOV-1']);
  });

  it('un cliente sin criterios contratados es un error, no un clonado vacío', () => {
    expect(() => buildClonePlan(input({ contractedTrustCriterionIds: [] }))).toThrow(NoTrustCriteriaError);
  });

  describe('idempotencia y personalización', () => {
    const firstRun = () => {
      const plan = buildClonePlan(input());
      return {
        plan,
        existing: {
          controls: new Map(plan.clientControls.map((c) => [c.controlId, c.id])),
          risks: new Map(plan.clientRisks.map((r) => [r.riskId, r.id])),
          causes: new Map(plan.clientCauses.map((k) => [k.causeId, k.id])),
          riskCauseKeys: new Set(plan.clientRiskCauses.map((e) => `${e.clientRiskId}#${e.clientCauseId}`)),
          causeControlKeys: new Set(plan.clientCauseControls.map((e) => `${e.clientCauseId}#${e.clientControlId}`)),
        },
      };
    };

    it('clonar de nuevo no crea nada', () => {
      const { existing } = firstRun();
      const again = buildClonePlan(input({ existing }));
      expect(Object.values(planSize(again)).every((n) => n === 0)).toBe(true);
    });

    it('lo que el cliente quitó de un control ya clonado no reaparece', () => {
      const { plan, existing } = firstRun();
      // el cliente borró las evidencias y las dimensiones de GOV-1: como el control ya existe, no se le vuelven a crear
      expect(plan.evidenceRequirements.length).toBeGreaterThan(0);
      const again = buildClonePlan(input({ existing }));
      expect(again.evidenceRequirements).toHaveLength(0);
      expect(again.clientControlDimensions).toHaveLength(0);
    });

    it('un control dado de baja o editado por el cliente no se recrea', () => {
      const { existing } = firstRun();
      existing.controls.delete('k2'); // simula que k2 no existe: solo ese vuelve
      const again = buildClonePlan(input({ existing }));
      expect(again.clientControls.map((c) => c.ownCode)).toEqual(['GOV-2']);
    });

    it('al sumar un criterio solo se clona lo nuevo y se enlaza con lo que ya había', () => {
      const { existing } = firstRun();
      const again = buildClonePlan(input({ contractedTrustCriterionIds: [SEC, AVL], existing }));
      expect(again.clientControls.map((c) => c.ownCode)).toEqual(['BCD-1']);
      expect(again.clientRisks).toHaveLength(0);
      // la causa c1 ya existía, pero k3 es nueva: la arista c1→k3 se agrega
      expect(again.clientCauseControls).toHaveLength(1);
    });
  });
});
