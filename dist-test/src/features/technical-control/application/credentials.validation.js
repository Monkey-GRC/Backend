"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCredentials = normalizeCredentials;
const technical_catalogs_1 = require("../../../common/catalogs/technical-catalogs");
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
function normalizeCredentials(category, raw) {
    const spec = technical_catalogs_1.CREDENTIAL_SPECS[category];
    const input = (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {});
    const errors = [];
    const method = spec.methods ? (input['connection_method'] ?? 'agent') : null;
    if (spec.methods && !spec.methods.includes(method)) {
        errors.push({ field: 'credentials.connection_method', code: 'enum.invalid' });
    }
    const allowed = new Set([...spec.required, ...spec.optional]);
    if (spec.methods)
        allowed.add('connection_method');
    if (method === 'ssh')
        spec.sshRequired.forEach((k) => allowed.add(k));
    for (const key of Object.keys(input)) {
        if (!allowed.has(key))
            errors.push({ field: `credentials.${key}`, code: 'field.not_allowed' });
    }
    const required = method === 'ssh' ? spec.sshRequired : spec.required;
    for (const key of required) {
        if (!isText(input[key]))
            errors.push({ field: `credentials.${key}`, code: 'required' });
    }
    for (const key of allowed) {
        const value = input[key];
        if (value === undefined || value === null || errors.some((e) => e.field === `credentials.${key}`))
            continue;
        if (typeof value !== 'string')
            errors.push({ field: `credentials.${key}`, code: 'string.invalid' });
        else if (value.length > technical_catalogs_1.CREDENTIAL_MAX_LENGTH)
            errors.push({ field: `credentials.${key}`, code: 'string.max' });
    }
    if (errors.length > 0)
        return { errors, toStore: null };
    const toStore = {};
    for (const key of allowed) {
        if (key === 'connection_method')
            continue;
        if (isText(input[key]))
            toStore[key] = input[key].trim();
    }
    if (method === 'ssh')
        toStore['connection_method'] = 'ssh';
    return { errors, toStore: Object.keys(toStore).length > 0 ? toStore : null };
}
//# sourceMappingURL=credentials.validation.js.map