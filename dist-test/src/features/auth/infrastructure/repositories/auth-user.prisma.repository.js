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
exports.AuthUserPrismaRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infrastructure/database/prisma.service");
const auth_user_entity_1 = require("../../domain/entities/auth-user.entity");
const auth_user_repository_1 = require("../../domain/repositories/auth-user.repository");
let AuthUserPrismaRepository = class AuthUserPrismaRepository extends auth_user_repository_1.AuthUserRepository {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async findCredentialsByEmail(email) {
        const rows = await this.prisma.$queryRaw `
      SELECT id, company_id, password_hash FROM platform.find_login_candidates(${email})
    `;
        const candidate = rows[0];
        if (!candidate)
            return null;
        const user = await this.prisma.withScope({ companyId: candidate.company_id, userId: candidate.id }, (tx) => tx.user.findUnique({
            where: { id: candidate.id },
            select: { role: true, status: true, failedLoginAttempts: true, lockedUntil: true },
        }));
        if (!user)
            return null;
        return new auth_user_entity_1.UserCredentials(candidate.id, candidate.company_id, candidate.password_hash, user.role, user.status, user.failedLoginAttempts, user.lockedUntil);
    }
    async findById(scope, userId) {
        const user = await this.prisma.withScope(scope, (tx) => tx.user.findUnique({
            where: { id: userId },
            include: { company: { select: { name: true } } },
        }));
        if (!user)
            return null;
        return new auth_user_entity_1.AuthUser(user.id, user.companyId, user.company.name, user.email, user.name, user.lastName, user.role, user.status, user.isMfaEnabled, user.lastLoginAt, user.createdAt);
    }
    async registerFailedLogin(scope, userId, state) {
        await this.prisma.withScope(scope, (tx) => tx.user.update({
            where: { id: userId },
            data: { failedLoginAttempts: state.failedLoginAttempts, lockedUntil: state.lockedUntil },
        }));
    }
    async registerSuccessfulLogin(scope, userId, at) {
        await this.prisma.withScope(scope, (tx) => tx.user.update({
            where: { id: userId },
            data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: at },
        }));
    }
};
exports.AuthUserPrismaRepository = AuthUserPrismaRepository;
exports.AuthUserPrismaRepository = AuthUserPrismaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthUserPrismaRepository);
//# sourceMappingURL=auth-user.prisma.repository.js.map