// Cómo se nombra, ante el cliente, una versión de un sistema operativo (D113). Lo usan el catálogo (`GET /v1/catalogs/<sistema>_version`) y el activo
// declarado (`agent.os_version`): así la pantalla ve el MISMO texto en la lista y en el detalle. Puro: sin Nest ni base de datos.

export type OsVersionParts = { distribution: string; distributionName: string; versionLabel: string };

// Una marca («Ubuntu», «Windows Server») no se traduce. Lo que NO es una marca (la opción «otra distribución») sale de i18n.
const NOT_A_BRAND = 'linux_generic';

export const isGenericDistribution = (distribution: string): boolean => distribution === NOT_A_BRAND;

export function osVersionLabel(v: OsVersionParts, t: (key: string) => string): string {
  return isGenericDistribution(v.distribution) ? t('catalogs.os_version.linux_generic') : `${v.distributionName} ${v.versionLabel}`;
}

export function osVersionGroupLabel(v: OsVersionParts, t: (key: string) => string): string {
  return isGenericDistribution(v.distribution) ? t('catalogs.os_group.linux_generic') : v.distributionName;
}
