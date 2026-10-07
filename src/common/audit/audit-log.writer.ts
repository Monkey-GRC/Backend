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

// Lo que una acción pide auditar JUNTO con su efecto (seguridad/requisitos.md, SEG-36; D41). El caso de uso la
// construye y se la pasa al repositorio que abre la transacción; este la ejecuta con el resultado ya escrito y,
// **dentro de esa misma transacción**, inserta la fila de auditoría. Si el insert falla, la acción entera se
// revierte: nunca queda una acción sin rastro, ni un rastro de una acción que no ocurrió.
// Puede devolver varias entradas cuando una sola acción cuenta como varios hechos auditables (p. ej. el canje de una
// clave, que además crea un usuario).
export type AuditIntent<TResult> = (result: TResult) => AuditEntry | AuditEntry[];

export abstract class AuditLogWriter {
  // Para lo que NO acompaña a una acción que pueda revertirse: intentos fallidos (login, canje, clave
  // inexistente), donde no hay efecto con el que ser atómico. Es de mejor esfuerzo: un fallo del audit no
  // tumba la respuesta, pero se registra en el log del servidor.
  abstract write(entry: AuditEntry): Promise<void>;
}
