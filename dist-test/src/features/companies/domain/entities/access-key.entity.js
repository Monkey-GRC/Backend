"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessKey = void 0;
class AccessKey {
    id;
    companyId;
    status;
    expiresAt;
    usedAt;
    constructor(id, companyId, status, expiresAt, usedAt) {
        this.id = id;
        this.companyId = companyId;
        this.status = status;
        this.expiresAt = expiresAt;
        this.usedAt = usedAt;
    }
    statusAt(now) {
        return this.status === 'pending' && this.expiresAt <= now ? 'expired' : this.status;
    }
}
exports.AccessKey = AccessKey;
//# sourceMappingURL=access-key.entity.js.map