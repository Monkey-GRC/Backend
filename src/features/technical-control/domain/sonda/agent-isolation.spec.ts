import { agentGroupsMatchTenant, checkAgentIsolation } from './agent-isolation';

const TENANT = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const ASSET = '33333333-3333-4333-8333-333333333333';
const link = { tenantId: TENANT, assetId: ASSET, agentId: '001' };
const reported = { agentId: '001', name: ASSET, groups: [TENANT] };
const check = (over: Partial<Parameters<typeof checkAgentIsolation>[0]> = {}) => checkAgentIsolation({ link, reported, tenantId: TENANT, assetId: ASSET, ...over });

describe('agentGroupsMatchTenant', () => {
  it('solo el grupo de la empresa, o el de la empresa más uno que no es de ninguna empresa', () => {
    expect(agentGroupsMatchTenant([TENANT], TENANT)).toBe(true);
    expect(agentGroupsMatchTenant([TENANT, 'linux'], TENANT)).toBe(true);
  });
  it('el grupo de otra empresa, solo o acompañando al nuestro, no vale', () => {
    expect(agentGroupsMatchTenant([OTHER], TENANT)).toBe(false);
    expect(agentGroupsMatchTenant([TENANT, OTHER], TENANT)).toBe(false);
    expect(agentGroupsMatchTenant([OTHER.toUpperCase(), TENANT], TENANT)).toBe(false);
  });
  it('sin grupos, o con grupos que no son el nuestro, no vale', () => {
    expect(agentGroupsMatchTenant([], TENANT)).toBe(false);
    expect(agentGroupsMatchTenant(['default'], TENANT)).toBe(false);
  });
});

describe('checkAgentIsolation (SEG-45)', () => {
  it('un agente enlazado a ESTE activo, con su nombre y el grupo de la empresa, pasa', () => {
    expect(check()).toEqual({ ok: true });
  });

  it.each([
    ['sin vínculo', { link: null }],
    ['enlazado a un activo de otra empresa', { link: { ...link, tenantId: OTHER } }],
    ['enlazado a otro activo de la misma empresa', { link: { ...link, assetId: '44444444-4444-4444-8444-444444444444' } }],
    ['el vínculo es de otro agente (el que llega no es el que Monkey pre-registró)', { link: { ...link, agentId: '002' } }],
  ])('%s → AGENT_NOT_LINKED', (_n, over) => {
    expect(check(over as never)).toEqual({ ok: false, code: 'AGENT_NOT_LINKED' });
  });

  it.each([
    ['el agente se declara del grupo de otra empresa', { reported: { ...reported, groups: [OTHER] } }],
    ['el agente está en el grupo de la empresa Y en el de otra', { reported: { ...reported, groups: [TENANT, OTHER] } }],
    ['el agente no tiene el nombre del activo', { reported: { ...reported, name: 'srv-01' } }],
    ['el agente no tiene grupos', { reported: { ...reported, groups: [] } }],
  ])('%s → AGENT_GROUP_MISMATCH', (_n, over) => {
    expect(check(over as never)).toEqual({ ok: false, code: 'AGENT_GROUP_MISMATCH' });
  });

  it('el vínculo se mira ANTES que el grupo: sin vínculo no se revela nada de cómo está el agente', () => {
    expect(check({ link: null, reported: { ...reported, groups: [OTHER] } })).toEqual({ ok: false, code: 'AGENT_NOT_LINKED' });
  });

  it('una empresa NO puede entregar resultados en nombre de otra aunque el agente sea legítimo', () => {
    // El agente es de TENANT, pero la ejecución es de OTHER: el trabajador (o quien finja serlo) no puede escribir en otra empresa.
    expect(check({ tenantId: OTHER })).toEqual({ ok: false, code: 'AGENT_NOT_LINKED' });
  });
});
