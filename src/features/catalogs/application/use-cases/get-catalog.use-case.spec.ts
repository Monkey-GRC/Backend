import { DomainError } from '../../../../common/errors/domain-error';
import { OsVersionItem } from '../../domain/entities/catalog-item';
import { ConnectionOptionCatalogRepository } from '../../domain/repositories/connection-option-catalog.repository';
import { CapabilityCatalogRepository } from '../../domain/repositories/capability-catalog.repository';
import { FrameworkCatalogRepository } from '../../domain/repositories/framework-catalog.repository';
import { OsVersionCatalogRepository } from '../../domain/repositories/os-version-catalog.repository';
import { RegionCatalogRepository } from '../../domain/repositories/region-catalog.repository';
import { RegulationCatalogRepository } from '../../domain/repositories/regulation-catalog.repository';
import { GetCatalogUseCase } from './get-catalog.use-case';

const UBUNTU: OsVersionItem = { code: 'ubuntu_22_04_lts', distribution: 'ubuntu', distributionName: 'Ubuntu', versionLabel: '22.04 LTS' };

class FakeOsVersions extends OsVersionCatalogRepository {
  asked: string[] = [];
  constructor(private readonly byOs: Record<string, OsVersionItem[]>) { super(); }
  findOfferableByOs(osCode: string) { this.asked.push(osCode); return Promise.resolve(this.byOs[osCode] ?? []); }
}

const none = { findAll: () => Promise.resolve([]) };
const use = (osVersions: OsVersionCatalogRepository) =>
  new GetCatalogUseCase(none as unknown as RegulationCatalogRepository, none as unknown as FrameworkCatalogRepository, none as unknown as CapabilityCatalogRepository, { findByPlatform: () => Promise.resolve([]) } as unknown as RegionCatalogRepository, osVersions, { findByCatalog: () => Promise.resolve([]) } as unknown as ConnectionOptionCatalogRepository);

describe('GetCatalogUseCase · <sistema>_version (D113)', () => {
  it('`linux_version` devuelve las versiones que la sonda entrega para Linux, leídas de la base', async () => {
    const repo = new FakeOsVersions({ linux: [UBUNTU] });
    expect(await use(repo).execute('linux_version')).toEqual({ kind: 'os_versions', items: [UBUNTU] });
    expect(repo.asked).toEqual(['linux']);
  });

  it('un sistema con guion bajo en su código (`hp_ux_version`) se lee entero', async () => {
    const repo = new FakeOsVersions({});
    await use(repo).execute('hp_ux_version').catch(() => undefined);
    expect(repo.asked).toEqual(['hp_ux']);
  });

  it('un sistema sin versiones que ofrecer (o que no existe) responde 404, como las regiones', async () => {
    await expect(use(new FakeOsVersions({})).execute('aix_version')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(use(new FakeOsVersions({})).execute('plan9_version')).rejects.toBeInstanceOf(DomainError);
  });

  it('no pisa otros catálogos: una lista fija sigue siendo una lista fija', async () => {
    const out = await use(new FakeOsVersions({})).execute('asset_criticality');
    expect(out.kind).toBe('enum');
  });
});
