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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../../../generated/prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor(config) {
        super({
            adapter: new adapter_pg_1.PrismaPg({
                connectionString: config.getOrThrow('APP_DATABASE_URL'),
            }),
        });
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    withScope(scope, work, options = {}) {
        return this.$transaction(async (tx) => {
            await tx.$queryRaw `
          SELECT set_config('app.tenant_id', ${scope.companyId}, true),
                 set_config('app.user_id', ${scope.userId ?? ''}, true),
                 set_config('app.user_role', ${scope.role ?? ''}, true)
        `;
            return work(tx);
        }, options.timeoutMs ? { timeout: options.timeoutMs, maxWait: 10_000 } : undefined);
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map