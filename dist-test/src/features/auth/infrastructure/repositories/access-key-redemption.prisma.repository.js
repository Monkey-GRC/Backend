"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessKeyRedemptionPrismaRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../../../../generated/prisma/client");
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const redeemable_access_key_entity_1 = require("../../domain/entities/redeemable-access-key.entity");
const access_key_redemption_repository_1 = require("../../domain/repositories/access-key-redemption.repository");
class KeyNoLongerPending extends Error {
}
let AccessKeyRedemptionPrismaRepository = class AccessKeyRedemptionPrismaRepository extends access_key_redemption_repository_1.AccessKeyRedemptionRepository {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async findByCodeHash(codeHash) {
        const rows = await this.prisma.$queryRaw `
      SELECT id, company_id FROM platform.find_access_key(${codeHash})
    `;
        const found = rows[0];
        if (!found)
            return null;
        const key = await this.prisma.withScope({ companyId: found.company_id }, (tx) => tx.accessKey.findUnique({ where: { id: found.id } }));
        return key
            ? new redeemable_access_key_entity_1.RedeemableAccessKey(key.id, key.companyId, key.status, key.expiresAt, key.usedAt)
            : null;
    }
    findCompany(scope) {
        return this.prisma.withScope(scope, (tx) => tx.company.findUnique({
            where: { id: scope.companyId },
            select: { id: true, name: true, adminEmail: true, status: true },
        }));
    }
    async redeem(scope, accessKeyId, admin, at) {
        try {
            const user = await this.prisma.withScope(scope, async (tx) => {
                const marked = await tx.accessKey.updateMany({
                    where: { id: accessKeyId, status: 'pending', usedAt: null, expiresAt: { gt: at } },
                    data: { status: 'used', usedAt: at },
                });
                if (marked.count !== 1)
                    throw new KeyNoLongerPending();
                return tx.user.create({
                    data: {
                        companyId: scope.companyId,
                        email: admin.email,
                        name: admin.name,
                        lastName: admin.lastName,
                        passwordHash: admin.passwordHash,
                        role: 'admin_empresa',
                        status: 'active',
                        passwordChangedAt: at,
                    },
                    select: { id: true },
                });
            });
            return { kind: 'created', userId: user.id };
        }
        catch (error) {
            if (error instanceof KeyNoLongerPending)
                return { kind: 'already_used' };
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                return { kind: 'email_taken' };
            }
            throw error;
        }
    }
};
exports.AccessKeyRedemptionPrismaRepository = AccessKeyRedemptionPrismaRepository;
exports.AccessKeyRedemptionPrismaRepository = AccessKeyRedemptionPrismaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccessKeyRedemptionPrismaRepository);
//# sourceMappingURL=access-key-redemption.prisma.repository.js.map