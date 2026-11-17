import { osVersionGroupLabel, osVersionLabel } from '../../../common/catalogs/os-version';
import { OsVersionItem } from '../domain/entities/catalog-item';

// Una opción de `<sistema>_version`: lo que la pantalla muestra y lo que viaja. `group` es el código de la distribución (agrupa) y `group_label` su nombre.
export type OsVersionOption = { value: string; label: string; group: string; group_label: string };

export function osVersionOption(i: OsVersionItem, t: (key: string) => string): OsVersionOption {
  return { value: i.code, label: osVersionLabel(i, t), group: i.distribution, group_label: osVersionGroupLabel(i, t) };
}
