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
var AuditLogPrismaWriter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogPrismaWriter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../../generated/prisma/client");
const audit_log_writer_1 = require("../../common/audit/audit-log.writer");
const prisma_service_1 = require("../database/prisma.service");
let AuditLogPrismaWriter = AuditLogPrismaWriter_1 = class AuditLogPrismaWriter extends audit_log_writer_1.AuditLogWriter {
    prisma;
    logger = new common_1.Logger(AuditLogPrismaWriter_1.name);
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async write(entry) {
        const insert = (db) => db.auditLog.createMany({
            data: [
                {
                    tenantId: entry.tenantId,
                    userId: entry.userId,
                    attemptedEmail: entry.attemptedEmail ?? null,
                    action: entry.action,
                    resource: entry.resource,
                    result: entry.result,
                    ipAddress: entry.ipAddress,
                    userAgent: entry.userAgent,
                    beforeState: entry.beforeState ?? client_1.Prisma.DbNull,
                    afterState: entry.afterState ?? client_1.Prisma.DbNull,
                },
            ],
        });
        try {
            if (entry.tenantId) {
                await this.prisma.withScope({ companyId: entry.tenantId, userId: entry.userId ?? undefined }, (tx) => insert(tx));
            }
            else {
                await insert(this.prisma);
            }
        }
        catch (error) {
            this.logger.error(`No se pudo escribir audit_logs (${entry.action})`, error);
        }
    }
};
exports.AuditLogPrismaWriter = AuditLogPrismaWriter;
exports.AuditLogPrismaWriter = AuditLogPrismaWriter = AuditLogPrismaWriter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogPrismaWriter);
//# sourceMappingURL=audit-log.prisma.writer.js.map