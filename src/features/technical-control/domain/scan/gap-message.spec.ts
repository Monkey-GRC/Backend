import { checkTitles, gapMessage, type CatalogCheck } from './gap-message';

const check = (patch: Partial<CatalogCheck> = {}): CatalogCheck => ({
  titleEn: 'Root account has MFA enabled',
  titleEs: null,
  condition: 'The root account must require a second factor.',
  remediation: 'Enable MFA on the root account.',
  remediationEs: null,
  translationOrigin: null,
  ...patch,
});
const base = { severity: 'critical' as const, assetCriticality: 'low', fallbackTitle: 'Comprobación sin título' };

// D138 punto 3 · El mensaje de una brecha, en el idioma de la persona, sin nombrar al proveedor.
describe('gapMessage', () => {
  it('da el título, qué se evaluó, la guía y la prioridad con su base', () => {
    const m = gapMessage({ ...base, check: check(), language: 'en' });
    expect(m.title).toBe('Root account has MFA enabled');
    expect(m.evaluated).toEqual({ text: 'The root account must require a second factor.', language: 'en', isAiGenerated: false });
    expect(m.remediation).toEqual({ text: 'Enable MFA on the root account.', language: 'en', isAiGenerated: false });
    expect(m.priority).toBe('high');
    expect(m.priorityBasis).toEqual({ severity: 'critical', assetCriticality: 'low' });
  });

  it('en español da la traducción como generada por IA mientras nadie la revise; si la revisaron, no', () => {
    const machine = gapMessage({ ...base, check: check({ titleEs: 'La cuenta raíz tiene doble factor', remediationEs: 'Activa el doble factor.', translationOrigin: 'machine' }), language: 'es' });
    expect(machine.title).toBe('La cuenta raíz tiene doble factor');
    expect(machine.remediation).toEqual({ text: 'Activa el doble factor.', language: 'es', isAiGenerated: true });
    const reviewed = gapMessage({ ...base, check: check({ remediationEs: 'Activa el doble factor.', translationOrigin: 'reviewed' }), language: 'es' });
    expect(reviewed.remediation).toEqual({ text: 'Activa el doble factor.', language: 'es', isAiGenerated: false });
  });

  it('sin traducción sale el original en inglés, dicho como inglés; el catálogo no trae la descripción en español', () => {
    const m = gapMessage({ ...base, check: check(), language: 'es' });
    expect(m.title).toBe('Root account has MFA enabled');
    expect(m.remediation?.language).toBe('en');
    expect(m.evaluated?.language).toBe('en');
  });

  it('un texto que nombra al proveedor no sale: la descripción y la guía van nulas y el título cae a uno neutro', () => {
    const m = gapMessage({ ...base, check: check({ titleEn: 'Prowler check failed', condition: 'Evaluated by Prowler', remediation: 'See the Wazuh documentation.' }), language: 'en' });
    expect(m.title).toBe('Comprobación sin título');
    expect(m.evaluated).toBeNull();
    expect(m.remediation).toBeNull();
  });

  it('una descripción vacía es nula; sin severidad (la sonda) la prioridad es la criticidad del activo', () => {
    const m = gapMessage({ ...base, severity: null, assetCriticality: 'critical', check: check({ condition: ' ' }), language: 'en' });
    expect(m.evaluated).toBeNull();
    expect(m.priority).toBe('critical');
    expect(m.priorityBasis.severity).toBeNull();
  });
});

describe('checkTitles (el aviso)', () => {
  it('da los dos idiomas y deja nulo el que nombra al proveedor', () => {
    expect(checkTitles({ titleEn: 'Wazuh agent is up', titleEs: 'El agente está activo' })).toEqual({ en: null, es: 'El agente está activo' });
  });
});
