// Las listas de Documentos que sirve `GET /v1/catalogs/{nombre}` (contracts/enums/documentos.md y catalogo-maestro.md, D133, D152). `my_document_status` no es columna: se deriva.
export const DOCUMENT_ENUM_CATALOGS = {
  document_type: ['policy', 'procedure', 'matrix', 'manual', 'document'],
  document_origin: ['internal', 'external'],
  document_acceptance: ['users_who_apply', 'all_users', 'not_required'],
  document_version_status: ['draft', 'in_approval', 'rejected', 'approved', 'current', 'renewal_due', 'expired', 'archived'],
  my_document_status: ['pending', 'accepted', 'overdue'],
} as const;
