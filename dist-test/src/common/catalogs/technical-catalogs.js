"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROBE_MODES = exports.NO_COVERAGE = exports.TECHNICAL_COVERAGE_TOTAL = exports.CREDENTIAL_MAX_LENGTH = exports.CREDENTIAL_SPECS = exports.SCOPE_MAX = exports.SCOPE_KEY_BY_ASSET_TYPE = exports.SCOPE_KEYS = exports.ASSET_TYPE_BY_CATEGORY = exports.FREQUENCIES_BY_CATEGORY = exports.SCHEDULE_FREQUENCY_VALUES = exports.DEFAULT_CRITICALITY = exports.ASSET_CRITICALITY_VALUES = exports.SCENARIO_CAPABILITIES = exports.CONNECTION_CATEGORY_VALUES = exports.DEPLOYMENT_SCENARIO_VALUES = void 0;
exports.DEPLOYMENT_SCENARIO_VALUES = [
    'cloud_managed_only',
    'cloud_with_servers',
    'on_premise',
    'hybrid',
];
exports.CONNECTION_CATEGORY_VALUES = ['ac_01', 'ac_02', 'ac_03', 'ac_04', 'ac_05', 'ac_06'];
exports.SCENARIO_CAPABILITIES = {
    cloud_managed_only: ['ac_01'],
    cloud_with_servers: ['ac_01', 'ac_02', 'ac_03'],
    on_premise: ['ac_04', 'ac_05', 'ac_06'],
    hybrid: exports.CONNECTION_CATEGORY_VALUES,
};
exports.ASSET_CRITICALITY_VALUES = ['low', 'medium', 'high', 'critical'];
exports.DEFAULT_CRITICALITY = 'medium';
exports.SCHEDULE_FREQUENCY_VALUES = ['continuous', 'every_6h', 'every_24h'];
exports.FREQUENCIES_BY_CATEGORY = {
    ac_01: ['every_6h', 'every_24h'],
    ac_02: ['continuous'],
    ac_03: ['continuous'],
    ac_04: ['continuous'],
    ac_05: ['continuous'],
    ac_06: ['continuous'],
};
exports.ASSET_TYPE_BY_CATEGORY = {
    ac_01: 'cloud_service',
    ac_02: 'server',
    ac_03: 'database',
    ac_04: 'server',
    ac_05: 'database',
    ac_06: 'endpoint',
};
exports.SCOPE_KEYS = ['server_count', 'cloud_count', 'app_count', 'database_count', 'endpoint_count'];
exports.SCOPE_KEY_BY_ASSET_TYPE = {
    server: 'server_count',
    cloud_service: 'cloud_count',
    application: 'app_count',
    database: 'database_count',
    endpoint: 'endpoint_count',
};
exports.SCOPE_MAX = 1_000_000;
exports.CREDENTIAL_SPECS = {
    ac_01: { methods: null, required: ['account_id', 'read_only_role'], optional: ['external_id'], sshRequired: [] },
    ac_02: { methods: ['agent', 'ssh'], required: [], optional: [], sshRequired: ['ssh_user', 'ssh_private_key'] },
    ac_03: { methods: null, required: ['db_user', 'db_password'], optional: ['db_port'], sshRequired: [] },
    ac_04: { methods: ['agent', 'ssh'], required: [], optional: [], sshRequired: ['ssh_user', 'ssh_private_key'] },
    ac_05: { methods: null, required: ['db_user', 'db_password'], optional: ['db_port'], sshRequired: [] },
    ac_06: { methods: ['agent'], required: [], optional: [], sshRequired: [] },
};
exports.CREDENTIAL_MAX_LENGTH = 8000;
exports.TECHNICAL_COVERAGE_TOTAL = 18;
exports.NO_COVERAGE = `0/${exports.TECHNICAL_COVERAGE_TOTAL}`;
exports.PROBE_MODES = ['simulated', 'unavailable'];
//# sourceMappingURL=technical-catalogs.js.map