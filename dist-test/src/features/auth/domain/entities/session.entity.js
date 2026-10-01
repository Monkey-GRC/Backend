"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
class Session {
    id;
    companyId;
    userId;
    createdAt;
    lastActivityAt;
    expiresAt;
    revokedAt;
    constructor(id, companyId, userId, createdAt, lastActivityAt, expiresAt, revokedAt) {
        this.id = id;
        this.companyId = companyId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.lastActivityAt = lastActivityAt;
        this.expiresAt = expiresAt;
        this.revokedAt = revokedAt;
    }
    stateAt(now, policy) {
        if (this.revokedAt)
            return 'revoked';
        if (now >= this.expiresAt)
            return 'expired';
        if (now.getTime() - this.lastActivityAt.getTime() > policy.idleTimeout * 1000)
            return 'idle';
        return 'active';
    }
    static expiresAtFor(createdAt, policy) {
        return new Date(createdAt.getTime() + policy.maxDuration * 1000);
    }
}
exports.Session = Session;
//# sourceMappingURL=session.entity.js.map