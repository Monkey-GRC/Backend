import { Dimension } from '../../domain/controls/control-readout';
import { ExclusionRecord, Person } from '../../domain/exclusions/exclusion.repository';
import { neutralName } from '../controls/control-response.mapper';

// Forma de contracts/modules/compliance-audit.md (MD-144). El test sale con su nombre neutro (D70): nunca el texto del comité ni el proveedor de la sonda.
const day = (d: Date) => d.toISOString().slice(0, 10);
const person = (p: Person) => ({ id: p.id, name: p.name, last_name: p.lastName });

export const toExclusion = (e: ExclusionRecord, t: (key: string) => string, now: Date = new Date()) => {
  return {
    id: e.id,
    service_id: e.serviceId,
    test: { id: e.test.id, display_name: neutralName(e.test.displayName, e.test.dimension as Dimension, t) },
    asset: { id: e.asset.id, name: e.asset.name },
    justification: e.justification,
    technical_justification: e.technicalJustification,
    status: e.status,
    // Una aprobada cuya vigencia ya pasó deja de excluir: el activo vuelve a contar.
    is_expired: e.status === 'approved' && day(e.validUntil) < day(now),
    valid_from: day(e.validFrom),
    valid_until: day(e.validUntil),
    proposed_by: person(e.proposedBy),
    requested_at: e.requestedAt.toISOString(),
    decided_by: e.decidedBy ? person(e.decidedBy) : null,
    decision_note: e.decisionNote,
    decided_at: e.decidedAt ? e.decidedAt.toISOString() : null,
  };
};
