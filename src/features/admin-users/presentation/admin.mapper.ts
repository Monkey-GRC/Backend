import { AdminAccount, Invitation, PersonStamp } from '../domain/admin-account';
import { InvitedAdmin } from '../application/use-cases/admin-accounts.use-cases';

// Forma de contracts/gestion-usuarios/administradores.md. Nunca sale el hash de la contraseña, el secreto del segundo factor ni la huella del código.
const toInviter = (p: PersonStamp) => ({ id: p.id, name: p.name, last_name: p.lastName, ...(p.purged ? { role: p.role, purged: true } : {}) });

export const toAdmin = (a: AdminAccount) => ({
  id: a.id,
  email: a.email,
  name: a.name,
  last_name: a.lastName,
  role: a.role,
  status: a.status,
  is_mfa_enabled: a.isMfaEnabled,
  last_login_at: a.lastLoginAt ? a.lastLoginAt.toISOString() : null,
  created_at: a.createdAt.toISOString(),
  invited_by: a.invitedBy ? toInviter(a.invitedBy) : null,
  purge_at: a.status === 'inactive' && a.purgeAt ? a.purgeAt.toISOString() : null,
});

export const toInvitation = (i: Invitation) => ({ delivery_status: i.deliveryStatus, expires_at: i.expiresAt.toISOString() });

export const toInvitedAdmin = (v: InvitedAdmin) => ({ ...toAdmin(v.admin), invitation: toInvitation(v.invitation) });
