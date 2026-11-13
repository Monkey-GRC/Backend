import { parsePolicyHeader } from './ruleset';

const UBUNTU = `# Security Configuration Assessment
# Copyright (C) 2015, Wazuh Inc.
policy:
  id: "cis_ubuntu22-04"
  file: "cis_ubuntu22-04.yml"
  name: "CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0."
  description: "Este documento proporciona orientación."
  references:
    - https://www.cisecurity.org/cis-benchmarks/

requirements:
  title: "Check that the SCA policy applies"
  condition: all
  rules:
    - 'f:/etc/os-release -> r:VERSION_ID="22.04"'

checks:
  - id: 28500
    title: "Ensure /tmp is a separate partition."
`;

describe('parsePolicyHeader', () => {
  it('lee el id OFICIAL, el nombre y el archivo de la cabecera `policy:`', () => {
    expect(parsePolicyHeader(UBUNTU, 'cis_ubuntu22-04.yml')).toEqual({ id: 'cis_ubuntu22-04', name: 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.', file: 'cis_ubuntu22-04.yml' });
  });

  it('el id sale del YAML, no del nombre del archivo', () => {
    const yaml = 'policy:\n  id: "cis_win2012"\n  file: "cis_win2012_non_r2.yml"\n  name: "CIS Microsoft Windows Server 2012 (non-R2) Benchmark v3.0.0."\nrequirements:\n';
    expect(parsePolicyHeader(yaml, 'cis_win2012_non_r2.yml')).toMatchObject({ id: 'cis_win2012', file: 'cis_win2012_non_r2.yml' });
  });

  it('acepta comillas simples, sin comillas y fin de línea de Windows', () => {
    expect(parsePolicyHeader("policy:\r\n  id: 'cis_a'\r\n  name: CIS A Benchmark\r\nrequirements:\r\n", 'a.yml')).toEqual({ id: 'cis_a', name: 'CIS A Benchmark', file: 'a.yml' });
  });

  it('no toma el `id:` de un check ni de ninguna sección que no sea `policy:`', () => {
    expect(parsePolicyHeader('policy:\n  name: "Solo nombre"\nchecks:\n  - id: 1\n', 'x.yml')).toBeNull();
  });

  it('un archivo sin cabecera, o sin id o nombre, devuelve null (el extractor lo trata como error)', () => {
    expect(parsePolicyHeader('requirements:\n  title: x\n', 'x.yml')).toBeNull();
    expect(parsePolicyHeader('policy:\n  id: "solo_id"\nrequirements:\n', 'x.yml')).toBeNull();
  });
});
