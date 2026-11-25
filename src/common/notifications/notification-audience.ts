import type { NotificationAudience } from './notification-type';

// D151 · Quién recibe un aviso de la cadena del control. Función pura: la cadena llega ya cargada (solo cuentas `active`) y el resultado es la lista de personas, sin repetir.

/** La cadena de un control: su dueño y su ejecutor activos y todos los `admin_empresa` activos de la empresa. */
export type ControlChain = { ownerId: string | null; executorId: string | null; adminIds: readonly string[] };

export type AudienceContext = {
  chain: ControlChain;
  /** Quien recibe la asignación (`assignee`). */
  assigneeId?: string | null;
  /** Autor de la entrega de evidencia (`uploader`). */
  uploaderId?: string | null;
  /** Quien causó el hecho: nunca se avisa a sí mismo. */
  actorId?: string | null;
};

/**
 * El dueño es `owner_id`; un control «Sin asignar» avisa a los administradores. El ejecutor es `executor_id` y, si es nulo, ejecuta el dueño (y, sin dueño, los administradores).
 * Una persona con dos papeles recibe UN aviso; quien causó el hecho no recibe ninguno.
 */
export function resolveRecipients(audiences: readonly NotificationAudience[], ctx: AudienceContext): string[] {
  const { chain } = ctx;
  const owners = chain.ownerId ? [chain.ownerId] : [...chain.adminIds];
  const executors = chain.executorId ? [chain.executorId] : owners;
  const people = (audience: NotificationAudience): readonly string[] => {
    switch (audience) {
      case 'owner': return owners;
      case 'executor': return executors;
      case 'company_admin': return chain.adminIds;
      case 'assignee': return ctx.assigneeId ? [ctx.assigneeId] : [];
      case 'uploader': return ctx.uploaderId ? [ctx.uploaderId] : [];
      // Documentos (MD-506) y la plataforma (DT-83): reservados, nadie los resuelve todavía.
      default: return [];
    }
  };
  const seen = new Set<string>();
  const out: string[] = [];
  for (const audience of audiences) {
    for (const id of people(audience)) {
      if (id === ctx.actorId || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}
