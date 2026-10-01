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
exports.HmacTokenHasher = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const token_hasher_1 = require("../../common/security/token-hasher");
let HmacTokenHasher = class HmacTokenHasher extends token_hasher_1.TokenHasher {
    pepper;
    constructor(config) {
        super();
        this.pepper = config.getOrThrow('TOKEN_HASH_PEPPER');
    }
    generate() {
        return (0, node_crypto_1.randomBytes)(32).toString('base64url');
    }
    hash(token) {
        return (0, node_crypto_1.createHmac)('sha256', this.pepper).update(token).digest('hex');
    }
};
exports.HmacTokenHasher = HmacTokenHasher;
exports.HmacTokenHasher = HmacTokenHasher = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HmacTokenHasher);
//# sourceMappingURL=hmac-token.hasher.js.map