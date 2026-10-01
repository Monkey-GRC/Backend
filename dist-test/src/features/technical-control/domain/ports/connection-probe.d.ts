import { ConnectionCategory, ProbeMode } from '../../../../common/catalogs/technical-catalogs';
export type ProbeInput = {
    category: ConnectionCategory;
    platform: string;
    ipAddress: string | null;
    credentials: Record<string, unknown> | null;
};
export type ProbeFieldError = {
    field: string;
    code: string;
};
export type ProbeResult = {
    ok: true;
    technicalCoverage: string;
    checksAvailable: number;
} | {
    ok: false;
    fields: ProbeFieldError[];
};
export declare abstract class ConnectionProbe {
    abstract readonly mode: ProbeMode;
    abstract readonly confirmsOperation: boolean;
    abstract validate(input: ProbeInput): Promise<ProbeResult>;
}
