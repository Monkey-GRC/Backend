"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const credential_cipher_1 = require("../../common/security/credential-cipher");
const token_hasher_1 = require("../../common/security/token-hasher");
const aes_credential_cipher_1 = require("./aes-credential.cipher");
const hmac_token_hasher_1 = require("./hmac-token.hasher");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            { provide: token_hasher_1.TokenHasher, useClass: hmac_token_hasher_1.HmacTokenHasher },
            { provide: credential_cipher_1.CredentialCipher, useClass: aes_credential_cipher_1.AesCredentialCipher },
        ],
        exports: [token_hasher_1.TokenHasher, credential_cipher_1.CredentialCipher],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map