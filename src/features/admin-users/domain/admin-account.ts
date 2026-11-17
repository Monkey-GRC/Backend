// Las cuentas de administrador de Monkey (contracts/gestion-usuarios/administradores.md, D117): quién es quién y qué estado tiene.

/** Días de gracia entre desactivar la cuenta y borrarla (D117). */
export const ADMIN_GRACE_DAYS = 7;

/** Quien ya no existe sale con su sello (`purged: true`); quien existe, con sus datos vivos. */
export type PersonStamp = { id: string; name: string | null; lastName: string | null; role: string; purged: boolean };

export type AdminAccount = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  role: string;
  status: string;
  isMfaEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  invitedBy: PersonStamp | null;
  purgeAt: Date | null;
};

/** El resultado de enviar el código por correo. El código nunca sale del correo (SEG-75, SEG-80). */
export type Invitation = { deliveryStatus: 'sent' | 'failed'; expiresAt: Date };

export type AdminSort = 'created_at' | '-created_at' | 'email' | '-email' | 'purge_at' | '-purge_at';
export const ADMIN_SORTS: readonly AdminSort[] = ['created_at', '-created_at', 'email', '-email', 'purge_at', '-purge_at'];
export type AdminFilters = { status?: string; sort: AdminSort; page: number; pageSize: number };

export type Refusal = 'cannot_deactivate_self' | 'last_admin';
export type DeactivationOutcome =
  | { kind: 'deactivated'; before: AdminAccount; after: AdminAccount; sessionsClosed: number }
  | { kind: 'refused'; reason: Refusal; targetId: string };

export type ReactivationOutcome = { before: AdminAccount; after: AdminAccount };
export type PurgedAdmin = { id: string; role: string };
