import { RulesetPolicy } from './build';

// Lee la cabecera `policy:` de un archivo de políticas de la sonda (YAML) SIN ejecutarlo ni interpretarlo: solo se leen cuatro líneas de texto. El id oficial
// de la política está AHÍ, no en el nombre del archivo (19 de las 77 no coinciden: p. ej. `cis_win2012_non_r2.yml` tiene el id `cis_win2012`).
const unquote = (s: string): string => s.trim().replace(/^["']|["']$/g, '').trim();

export function parsePolicyHeader(yaml: string, fileName: string): RulesetPolicy | null {
  const block = /^policy:\r?\n([\s\S]*?)^\S/m.exec(yaml.replace(/\r/g, ''))?.[1];
  if (!block) return null;
  // Solo las líneas del primer nivel del bloque (las de `references:` y similares van más hundidas y no se tocan).
  const get = (key: string): string => {
    const m = new RegExp(`^ {1,4}${key}:\\s*(.+)$`, 'm').exec(block);
    return m ? unquote(m[1]) : '';
  };
  const id = get('id');
  const name = get('name');
  return id && name ? { id, name, file: fileName } : null;
}
