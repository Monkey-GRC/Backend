"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulatedConnectionProbe = exports.SIMULATED_DENIED_MARKER = void 0;
const technical_catalogs_1 = require("../../../../common/catalogs/technical-catalogs");
const connection_probe_1 = require("../../domain/ports/connection-probe");
exports.SIMULATED_DENIED_MARKER = 'permission-denied';
const FIELD_BY_KEY = [
    ['read_only_role', 'credentials.read_only_role'],
    ['ssh_user', 'credentials.ssh_user'],
    ['db_user', 'credentials.db_user'],
];
class SimulatedConnectionProbe extends connection_probe_1.ConnectionProbe {
    mode = 'simulated';
    confirmsOperation = false;
    async validate(input) {
        const values = Object.values(input.credentials ?? {}).filter((v) => typeof v === 'string');
        if (values.some((v) => v.includes(exports.SIMULATED_DENIED_MARKER))) {
            const present = FIELD_BY_KEY.find(([key]) => key in (input.credentials ?? {}));
            return {
                ok: false,
                fields: [{ field: present?.[1] ?? 'credentials', code: 'connection.permission_denied' }],
            };
        }
        return { ok: true, technicalCoverage: `${technical_catalogs_1.TECHNICAL_COVERAGE_TOTAL}/${technical_catalogs_1.TECHNICAL_COVERAGE_TOTAL}`, checksAvailable: 402 };
    }
}
exports.SimulatedConnectionProbe = SimulatedConnectionProbe;
//# sourceMappingURL=simulated-connection.probe.js.map