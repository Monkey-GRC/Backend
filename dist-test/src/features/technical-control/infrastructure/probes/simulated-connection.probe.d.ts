import { ConnectionProbe, ProbeInput, ProbeResult } from '../../domain/ports/connection-probe';
export declare const SIMULATED_DENIED_MARKER = "permission-denied";
export declare class SimulatedConnectionProbe extends ConnectionProbe {
    readonly mode: "simulated";
    readonly confirmsOperation = false;
    validate(input: ProbeInput): Promise<ProbeResult>;
}
