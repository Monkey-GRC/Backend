import { buildCatalogLookup, CatalogPolicy } from './catalog-lookup';

const ubuntu: CatalogPolicy = {
  scaId: 'cis_ubuntu22-04',
  benchmark: 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.',
  checks: [
    { id: 'u-1', platform: 'Ubuntu', checkId: '28500' },
    { id: 'u-2', platform: 'Ubuntu', checkId: '28501' },
  ],
};
const win: CatalogPolicy = { scaId: 'cis_win2022', benchmark: 'CIS Windows Server 2022', checks: [{ id: 'w-1', platform: 'Windows', checkId: '28500' }] };

describe('buildCatalogLookup', () => {
  it('reconoce un check por el id de su política', () => {
    const { lookup } = buildCatalogLookup([ubuntu, win], [{ policyId: 'cis_ubuntu22-04', name: 'x' }]);
    expect(lookup('cis_ubuntu22-04', 'x', '28501')).toEqual({ id: 'u-2', platform: 'Ubuntu', policyId: 'cis_ubuntu22-04', rawCheckId: '28501' });
  });

  it('el mismo número de check en dos políticas distintas no se confunde (la clave es de tres partes)', () => {
    const { lookup } = buildCatalogLookup([ubuntu, win], [{ policyId: 'cis_ubuntu22-04', name: 'a' }, { policyId: 'cis_win2022', name: 'b' }]);
    expect(lookup('cis_ubuntu22-04', 'a', '28500')?.id).toBe('u-1');
    expect(lookup('cis_win2022', 'b', '28500')?.id).toBe('w-1');
  });

  it('si el id no está, reconoce la política por su nombre (sin mayúsculas, espacios ni punto final)', () => {
    const { lookup } = buildCatalogLookup([ubuntu], [{ policyId: 'otro_id', name: '  cis ubuntu linux 22.04 LTS benchmark   v2.0.0 ' }]);
    expect(lookup('otro_id', '  cis ubuntu linux 22.04 LTS benchmark   v2.0.0 ', '28500')?.id).toBe('u-1');
  });

  it('lo que el catálogo no conoce no se inventa: devuelve null', () => {
    const { lookup } = buildCatalogLookup([ubuntu], [{ policyId: 'cis_ubuntu22-04', name: 'x' }]);
    expect(lookup('cis_ubuntu22-04', 'x', '99999')).toBeNull();
    expect(lookup('cis_desconocida', 'Otra', '28500')).toBeNull();
  });

  it('el conjunto ejecutado son los checks de las políticas entregadas que reconocemos (una sola vez cada una)', () => {
    const r = buildCatalogLookup([ubuntu, win], [{ policyId: 'cis_ubuntu22-04', name: 'x' }, { policyId: 'cis_ubuntu22-04', name: 'x' }, { policyId: 'desconocida', name: 'y' }]);
    expect(r.executed).toBe(2);
  });
});
