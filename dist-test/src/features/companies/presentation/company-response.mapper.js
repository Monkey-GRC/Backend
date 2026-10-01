"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRegisteredCompanyResponse = toRegisteredCompanyResponse;
exports.toCompanyListItem = toCompanyListItem;
exports.toCompanyDetail = toCompanyDetail;
const iso = (date) => date?.toISOString() ?? null;
const companyFields = (c) => ({
    id: c.id,
    name: c.name,
    admin_email: c.adminEmail,
    isolation_strategy: c.isolationStrategy,
    status: c.status,
    created_at: c.createdAt.toISOString(),
});
function toRegisteredCompanyResponse(result) {
    const now = new Date();
    return {
        ...companyFields(result.company),
        updated_at: result.company.updatedAt.toISOString(),
        access_key: {
            id: result.accessKey.id,
            code: result.accessKeyCode,
            status: result.accessKey.statusAt(now),
            expires_at: result.accessKey.expiresAt.toISOString(),
        },
    };
}
function toCompanyListItem(overview, now = new Date()) {
    const key = overview.currentAccessKey;
    return {
        ...companyFields(overview.company),
        access_key_status: key?.statusAt(now) ?? null,
        access_key_expires_at: iso(key?.expiresAt ?? null),
        onboarding_completed: overview.onboardingCompleted,
    };
}
const toAccessKeyHistoryItem = (key, now) => ({
    id: key.id,
    status: key.statusAt(now),
    expires_at: key.expiresAt.toISOString(),
    used_at: iso(key.usedAt),
});
function toCompanyDetail(detail) {
    const now = new Date();
    return {
        ...toCompanyListItem(detail, now),
        updated_at: detail.company.updatedAt.toISOString(),
        access_keys: detail.accessKeys.map((key) => toAccessKeyHistoryItem(key, now)),
    };
}
//# sourceMappingURL=company-response.mapper.js.map