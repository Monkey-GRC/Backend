import { osVersionLabel } from '../../../common/catalogs/os-version';
import { InstallOption } from '../domain/agent-install/install-command';
import { InstallView } from '../application/use-cases/agent-install.use-cases';

type Translate = (key: string) => string;

const osVersion = (v: InstallView['osVersion'], t: Translate) => ({ value: v.code, label: osVersionLabel(v, t) });

// El estado: lo que la pantalla consulta una y otra vez. No lleva ningún secreto. El motivo de un fallo sale ya traducido (nunca el mensaje de la sonda).
export function toInstallStateResponse(v: InstallView, t: Translate) {
  return {
    status: v.status,
    failure_message: v.failureReason ? t(v.failureReason) : null,
    os: v.os,
    os_version: osVersion(v.osVersion, t),
    expires_at: v.expiresAt?.toISOString() ?? null,
    requires_outbound: v.requiresOutbound,
    connection: { status: v.connection.status, watching: v.connection.watching, last_sync_at: v.connection.lastSyncAt?.toISOString() ?? null },
  };
}

const toOption = (o: InstallOption) =>
  o.kind === 'command' ? { kind: o.kind, label: o.label, shell: o.shell, value: o.value } : { kind: o.kind, label: o.label, filename: o.filename, content: o.content };

// El comando (y el archivo de Windows) llevan la clave del servidor: SENSIBLE. Solo sale aquí, una vez.
export function toInstallRevealResponse(r: { options: InstallOption[]; os: string; osVersion: InstallView['osVersion']; requiresOutbound: InstallView['requiresOutbound'] }, t: Translate) {
  return { os: r.os, os_version: osVersion(r.osVersion, t), options: r.options.map(toOption), requires_outbound: r.requiresOutbound };
}
