// Puerto del audit trail de plataforma (audit.audit_logs, append-only, 7 años — §5.3).
// Lo implementa la infraestructura; los casos de uso solo conocen esta abstracción.
export type AuditEntry = {
  tenantId: string | null;
  userId: string | null;
  attemptedEmail?: string | null;
  action: string;
  resource: string;
  result: 'success' | 'error';
  ipAddress: string;
  userAgent: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
};

export abstract class AuditLogWriter {
  abstract write(entry: AuditEntry): Promise<void>;
}
