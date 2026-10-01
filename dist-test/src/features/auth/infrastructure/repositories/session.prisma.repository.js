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
exports.SessionPrismaRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const session_entity_1 = require("../../domain/entities/session.entity");
const session_repository_1 = require("../../domain/repositories/session.repository");
const toEntity = (row) => new session_entity_1.Session(row.id, row.companyId, row.userId, row.createdAt, row.lastActivityAt, row.expiresAt, row.revokedAt);
let SessionPrismaRepository = class SessionPrismaRepository extends session_repository_1.SessionRepository {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async create(scope, data) {
        const row = await this.prisma.withScope(scope, (tx) => tx.session.create({
            data: {
                companyId: scope.companyId,
                userId: data.userId,
                refreshTokenHash: data.refreshTokenHash,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                createdAt: data.createdAt,
                lastActivityAt: data.createdAt,
                expiresAt: data.expiresAt,
            },
        }));
        return toEntity(row);
    }
    async findByRefreshTokenHash(hash) {
        const rows = await this.prisma.$queryRaw `
      SELECT id, company_id, user_id FROM platform.find_session_by_token(${hash})
    `;
        const found = rows[0];
        if (!found)
            return null;
        return this.findById({ companyId: found.company_id, userId: found.user_id }, found.id);
    }
    async findById(scope, sessionId) {
        const row = await this.prisma.withScope(scope, (tx) => tx.session.findUnique({ where: { id: sessionId } }));
        return row ? toEntity(row) : null;
    }
    async rotate(scope, sessionId, newHash, at) {
        await this.prisma.withScope(scope, (tx) => tx.session.update({
            where: { id: sessionId },
            data: { refreshTokenHash: newHash, lastActivityAt: at },
        }));
    }
    async touch(scope, sessionId, at) {
        await this.prisma.withScope(scope, (tx) => tx.session.update({ where: { id: sessionId }, data: { lastActivityAt: at } }));
    }
    async revoke(scope, sessionId, at) {
        await this.prisma.withScope(scope, (tx) => tx.session.updateMany({
            where: { id: sessionId, revokedAt: null },
            data: { revokedAt: at },
        }));
    }
};
exports.SessionPrismaRepository = SessionPrismaRepository;
exports.SessionPrismaRepository = SessionPrismaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionPrismaRepository);
//# sourceMappingURL=session.prisma.repository.js.map