"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedeemableAccessKey = void 0;
class RedeemableAccessKey {
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
    stateAt(now) {
        if (this.status === 'revoked')
            return 'revoked';
        if (this.status === 'used' || this.usedAt)
            return 'used';
        if (this.status === 'expired' || this.expiresAt <= now)
            return 'expired';
        return 'redeemable';
    }
}
exports.RedeemableAccessKey = RedeemableAccessKey;
//# sourceMappingURL=redeemable-access-key.entity.js.map