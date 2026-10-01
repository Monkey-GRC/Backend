"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = void 0;
class DomainError extends Error {
    code;
    details;
    constructor(code, details = {}) {
        super(code);
        this.code = code;
        this.details = details;
    }
}
exports.DomainError = DomainError;
//# sourceMappingURL=domain-error.js.map