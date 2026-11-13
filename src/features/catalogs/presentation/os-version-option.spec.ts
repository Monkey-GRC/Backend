import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { osVersionOption } from './os-version-option';

const t = (key: string) => `«${key}»`;

describe('osVersionOption', () => {
  it('una versión con marca: «Ubuntu 22.04 LTS», agrupada bajo Ubuntu; la marca no se traduce', () => {
    expect(osVersionOption({ code: 'ubuntu_22_04_lts', distribution: 'ubuntu', distributionName: 'Ubuntu', versionLabel: '22.04 LTS' }, t)).toEqual({
      value: 'ubuntu_22_04_lts', label: 'Ubuntu 22.04 LTS', group: 'ubuntu', group_label: 'Ubuntu',
    });
  });

  it('Windows Server y Windows de escritorio son grupos distintos', () => {
    expect(osVersionOption({ code: 'windows_server_2022', distribution: 'windows_server', distributionName: 'Windows Server', versionLabel: '2022' }, t)).toMatchObject({ label: 'Windows Server 2022', group_label: 'Windows Server' });
    expect(osVersionOption({ code: 'windows_desktop_11', distribution: 'windows_desktop', distributionName: 'Windows', versionLabel: '11' }, t)).toMatchObject({ label: 'Windows 11', group_label: 'Windows' });
  });

  it('«otra distribución» no es una marca: su etiqueta y su grupo salen de i18n', () => {
    expect(osVersionOption({ code: 'linux_generic', distribution: 'linux_generic', distributionName: 'Linux', versionLabel: 'generic' }, t)).toEqual({
      value: 'linux_generic', label: '«catalogs.os_version.linux_generic»', group: 'linux_generic', group_label: '«catalogs.os_group.linux_generic»',
    });
  });
});

describe('textos de las versiones', () => {
  const text = (lang: string) => JSON.parse(readFileSync(join('i18n', lang, 'catalogs.json'), 'utf8'));

  it.each(['es', 'en'])('«otra distribución» tiene su texto en %s', (lang) => {
    const c = text(lang);
    expect(c.os_version?.linux_generic?.trim()).toBeTruthy();
    expect(c.os_group?.linux_generic?.trim()).toBeTruthy();
  });

  it('ningún texto para el cliente nombra a un proveedor de la sonda', () => {
    for (const lang of ['es', 'en']) {
      const c = text(lang);
      expect(JSON.stringify({ a: c.os_version, b: c.os_group })).not.toMatch(/prowler|wazuh/i);
    }
  });
});
