import type { ControlChain } from '../../common/notifications/notification-audience';
import { partyOf, type ControlNoticeParams } from '../../common/notifications/notification-draft';
import { publicText } from '../../common/text/provider-names';
import type { TransactionClient } from '../database/prisma.service';

// D151 · La cadena de un control para avisar: quién lo atiende (dueño y ejecutor ACTIVOS), los administradores activos de la empresa y lo que el texto necesita (código, nombre, servicio,
// requisitos del marco). Un número FIJO de consultas por lote, sin importar cuántos controles sean.
//
// Las mismas reglas que `compliance/infrastructure/shared/control-access.loader.ts` (dueño y ejecutor activos) y `service-snapshot.loader.ts` (`placementsOf`: solo cuentan los requisitos
// de los marcos y categorías CONTRATADOS del servicio, D80). Una feature no importa el interior de otra: un cambio de esas reglas toca los tres sitios.
const PERSON = { select: { id: true, name: true, lastName: true, role: true, status: true } } as const;

export type ControlFacts = {
  controlId: string;
  serviceId: string;
  chain: ControlChain;
  /** Lo que el texto de cualquier aviso del control necesita; el emisor le suma lo suyo. */
  params: Pick<ControlNoticeParams, 'control_code' | 'control_name' | 'requirement_codes' | 'service_id' | 'service_name' | 'owner' | 'executor'>;
};

export async function activeAdminIds(tx: TransactionClient): Promise<string[]> {
  return (await tx.user.findMany({ where: { role: 'admin_empresa', status: 'active' }, select: { id: true }, orderBy: { id: 'asc' } })).map((u) => u.id);
}

export async function loadControlFacts(tx: TransactionClient, controlIds: readonly string[]): Promise<Map<string, ControlFacts>> {
  const out = new Map<string, ControlFacts>();
  if (controlIds.length === 0) return out;
  const rows = await tx.clientControl.findMany({
    where: { id: { in: [...controlIds] } },
    select: {
      id: true, serviceId: true, ownCode: true, name: true,
      service: { select: { name: true } },
      assignment: { select: { owner: PERSON, executor: PERSON } },
      control: { select: { code: true, name: true, pointOfFocusControls: { select: { pointOfFocus: { select: { requirement: { select: { code: true, frameworkId: true, trustCriterion: { select: { criterion: true } } } } } } } } } },
    },
  });
  const serviceIds = [...new Set(rows.map((r) => r.serviceId))];
  const frameworks = await tx.serviceFramework.findMany({ where: { serviceId: { in: serviceIds } }, select: { serviceId: true, frameworkId: true } });
  const criteria = await tx.serviceTrustCriterion.findMany({ where: { serviceId: { in: serviceIds } }, select: { serviceId: true, trustCriterion: { select: { criterion: true } } } });
  const contractedFrameworks = new Map<string, Set<string>>();
  for (const f of frameworks) contractedFrameworks.set(f.serviceId, (contractedFrameworks.get(f.serviceId) ?? new Set()).add(f.frameworkId));
  const contractedCriteria = new Map<string, Set<string>>();
  for (const c of criteria) contractedCriteria.set(c.serviceId, (contractedCriteria.get(c.serviceId) ?? new Set()).add(c.trustCriterion.criterion));
  const adminIds = await activeAdminIds(tx);

  const active = (u: { id: string; name: string | null; lastName: string | null; role: string; status: string } | null | undefined) => (u && u.status === 'active' ? u : null);
  for (const r of rows) {
    const owner = active(r.assignment?.owner);
    const executor = active(r.assignment?.executor);
    const codes = new Set<string>();
    for (const link of r.control?.pointOfFocusControls ?? []) {
      const req = link.pointOfFocus.requirement;
      if (contractedFrameworks.get(r.serviceId)?.has(req.frameworkId) && contractedCriteria.get(r.serviceId)?.has(req.trustCriterion.criterion)) codes.add(req.code);
    }
    out.set(r.id, {
      controlId: r.id,
      serviceId: r.serviceId,
      chain: { ownerId: owner?.id ?? null, executorId: executor?.id ?? null, adminIds },
      params: {
        control_code: r.control?.code ?? r.ownCode,
        // Un texto del catálogo pasa por el filtro de proveedor (SEG-39): si nombrara a la sonda, se muestra el código.
        control_name: publicText(r.control?.name ?? r.name) ?? r.control?.code ?? r.ownCode,
        requirement_codes: [...codes].sort(),
        service_id: r.serviceId,
        service_name: r.service.name,
        owner: partyOf(owner),
        executor: partyOf(executor),
      },
    });
  }
  return out;
}

/** Nombre y papel de una persona de la empresa (quien causó el hecho), para el texto. */
export async function loadParty(tx: TransactionClient, userId: string): Promise<ReturnType<typeof partyOf>> {
  return partyOf(await tx.user.findFirst({ where: { id: userId }, select: { name: true, lastName: true, role: true } }));
}
