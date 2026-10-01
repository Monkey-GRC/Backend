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
export declare abstract class AuditLogWriter {
    abstract write(entry: AuditEntry): Promise<void>;
}
