import { ConnectionProbe, ProbeResult } from '../../domain/ports/connection-probe';
export declare class UnavailableConnectionProbe extends ConnectionProbe {
    readonly mode: "unavailable";
    readonly confirmsOperation = false;
    validate(): Promise<ProbeResult>;
}
