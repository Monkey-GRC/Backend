// Qué sistema operativo es un servidor, a partir de la imagen con la que se lanzó (nombre y descripción de la AMI).
// Es una INFERENCIA: AWS no dice el sistema operativo de una máquina, dice de qué imagen salió. Quien la use debe etiquetarla como tal.
// Solo reconoce lo que se reconoce con certeza; ante la duda devuelve null (mejor «no sabemos» que un dato falso).

const UBUNTU_CODENAMES: Record<string, string> = { noble: '24.04', jammy: '22.04', focal: '20.04', bionic: '18.04', xenial: '16.04' };
const DEBIAN_CODENAMES: Record<string, string> = { trixie: '13', bookworm: '12', bullseye: '11', buster: '10' };

export function osFromImage(name: string | null | undefined, description: string | null | undefined): string | null {
  const text = `${name ?? ''} ${description ?? ''}`.toLowerCase();
  if (!text.trim()) return null;

  if (text.includes('ubuntu')) {
    const version = /\b(\d{2}\.\d{2})\b/.exec(text)?.[1] ?? Object.entries(UBUNTU_CODENAMES).find(([c]) => text.includes(c))?.[1];
    return version ? `Ubuntu ${version}` : 'Ubuntu';
  }
  if (/al2023|amazon linux 2023/.test(text)) return 'Amazon Linux 2023';
  if (/amzn2|amazon linux 2\b/.test(text)) return 'Amazon Linux 2';
  if (text.includes('amazon linux')) return 'Amazon Linux';
  if (text.includes('windows')) {
    const year = /windows[_ -]server[- _]?(\d{4})/.exec(text)?.[1];
    return year ? `Windows Server ${year}` : 'Windows';
  }
  if (/rhel|red hat/.test(text)) {
    const major = /(?:rhel|red hat enterprise linux)[- _]?(\d{1,2})(?:\.\d+)?/.exec(text)?.[1];
    return major ? `Red Hat Enterprise Linux ${major}` : 'Red Hat Enterprise Linux';
  }
  if (text.includes('debian')) {
    const version = /debian[- _]?(\d{1,2})\b/.exec(text)?.[1] ?? Object.entries(DEBIAN_CODENAMES).find(([c]) => text.includes(c))?.[1];
    return version ? `Debian ${version}` : 'Debian';
  }
  if (text.includes('rocky')) return 'Rocky Linux';
  if (text.includes('almalinux')) return 'AlmaLinux';
  if (text.includes('centos')) return 'CentOS';
  if (/suse|sles/.test(text)) return 'SUSE Linux';
  if (text.includes('fedora')) return 'Fedora';
  return null;
}
