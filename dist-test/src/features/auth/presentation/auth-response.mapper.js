"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAuthResponse = toAuthResponse;
function toAuthResponse(user, onboarding) {
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            last_name: user.lastName,
            role: user.role,
            status: user.status,
            is_mfa_enabled: user.isMfaEnabled,
            last_login_at: user.lastLoginAt?.toISOString() ?? null,
            created_at: user.createdAt.toISOString(),
        },
        company: { id: user.companyId, name: user.companyName },
        ...(onboarding ? { onboarding } : {}),
    };
}
//# sourceMappingURL=auth-response.mapper.js.map