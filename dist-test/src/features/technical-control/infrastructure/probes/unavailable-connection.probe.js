"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnavailableConnectionProbe = void 0;
const domain_error_1 = require("../../../../common/errors/domain-error");
const connection_probe_1 = require("../../domain/ports/connection-probe");
class UnavailableConnectionProbe extends connection_probe_1.ConnectionProbe {
    mode = 'unavailable';
    confirmsOperation = false;
    validate() {
        return Promise.reject(new domain_error_1.DomainError('CONNECTION_UNAVAILABLE'));
    }
}
exports.UnavailableConnectionProbe = UnavailableConnectionProbe;
//# sourceMappingURL=unavailable-connection.probe.js.map