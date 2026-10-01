"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConnectionProbe = createConnectionProbe;
const technical_catalogs_1 = require("../../../../common/catalogs/technical-catalogs");
const simulated_connection_probe_1 = require("./simulated-connection.probe");
const unavailable_connection_probe_1 = require("./unavailable-connection.probe");
function createConnectionProbe(config) {
    const mode = (config.get('PROBE_MODE')?.trim() || 'unavailable');
    if (!technical_catalogs_1.PROBE_MODES.includes(mode)) {
        throw new Error(`PROBE_MODE inválido: "${mode}". Usa ${technical_catalogs_1.PROBE_MODES.join(' o ')}.`);
    }
    if (mode === 'simulated' && config.get('NODE_ENV') === 'production') {
        throw new Error('PROBE_MODE=simulated no está permitido en producción.');
    }
    return mode === 'simulated' ? new simulated_connection_probe_1.SimulatedConnectionProbe() : new unavailable_connection_probe_1.UnavailableConnectionProbe();
}
//# sourceMappingURL=connection-probe.factory.js.map