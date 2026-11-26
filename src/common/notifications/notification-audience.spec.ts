import { resolveRecipients } from './notification-audience';
import { AUDIENCES, EMITTED_TYPES, NOTIFICATION_TYPES } from './notification-type';

// D138, D151 · Quién recibe cada aviso de la cadena del control.
const chain = { ownerId: 'owner', executorId: 'exec', adminIds: ['adm-1', 'adm-2'] };

describe('resolveRecipients', () => {
  it('ejecutor y dueño: cada uno, una vez', () => {
    expect(resolveRecipients(['executor', 'owner'], { chain })).toEqual(['exec', 'owner']);
  });

  it('sin ejecutor ejecuta el dueño y no se repite', () => {
    expect(resolveRecipients(['executor', 'owner'], { chain: { ...chain, executorId: null } })).toEqual(['owner']);
  });

  it('un control «Sin asignar» (sin dueño ni ejecutor) avisa a los administradores', () => {
    expect(resolveRecipients(['executor', 'owner'], { chain: { ...chain, ownerId: null, executorId: null } })).toEqual(['adm-1', 'adm-2']);
  });

  it('el administrador es todo admin_empresa activo, y quien ya es dueño no recibe dos', () => {
    expect(resolveRecipients(['executor', 'owner', 'company_admin'], { chain: { ownerId: 'adm-1', executorId: null, adminIds: ['adm-1', 'adm-2'] } })).toEqual(['adm-1', 'adm-2']);
  });

  it('quien causa el hecho no se avisa a sí mismo', () => {
    expect(resolveRecipients(['uploader', 'owner'], { chain, uploaderId: 'owner', actorId: 'owner' })).toEqual([]);
    expect(resolveRecipients(['uploader', 'owner'], { chain, uploaderId: 'up', actorId: 'owner' })).toEqual(['up']);
  });

  it('assignee y uploader salen del hecho; sin ellos, nadie', () => {
    expect(resolveRecipients(['assignee'], { chain, assigneeId: 'new-owner' })).toEqual(['new-owner']);
    expect(resolveRecipients(['assignee'], { chain })).toEqual([]);
    expect(resolveRecipients(['uploader'], { chain })).toEqual([]);
  });

  it('las audiencias reservadas (Documentos, plataforma) todavía no resuelven a nadie', () => {
    expect(resolveRecipients(['document_approver', 'document_pending_acceptor', 'document_owner', 'monkey_admins'], { chain })).toEqual([]);
  });
});

describe('AUDIENCES · el catálogo del contrato', () => {
  it('cada tipo tiene audiencias y los emitidos hoy son los de MD-515 y MD-508', () => {
    for (const type of NOTIFICATION_TYPES) expect(AUDIENCES[type].length).toBeGreaterThan(0);
    expect([...EMITTED_TYPES].sort()).toEqual(['automatic_evidence_stale', 'check_parameters_changed', 'control_assigned', 'direct_check_failed', 'evidence_approved', 'evidence_rejected', 'window_due_soon', 'window_expired']);
  });

  it('los destinatarios de los cinco son los de D138 y D151', () => {
    expect(AUDIENCES.direct_check_failed).toEqual(['executor', 'owner', 'company_admin']);
    expect(AUDIENCES.check_parameters_changed).toEqual(['company_admin']);
    expect(AUDIENCES.automatic_evidence_stale).toEqual(['executor', 'owner']);
    expect(AUDIENCES.window_due_soon).toEqual(['executor', 'owner']);
    expect(AUDIENCES.window_expired).toEqual(['executor', 'owner', 'company_admin']);
    expect(AUDIENCES.control_assigned).toEqual(['assignee']);
    expect(AUDIENCES.evidence_approved).toEqual(['uploader', 'owner']);
    expect(AUDIENCES.evidence_rejected).toEqual(['uploader', 'owner']);
  });
});
