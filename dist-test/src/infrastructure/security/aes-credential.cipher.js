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
exports.AesCredentialCipher = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const credential_cipher_1 = require("../../common/security/credential-cipher");
const VERSION = 'v1';
const KEY_BYTES = 32;
const IV_BYTES = 12;
let AesCredentialCipher = class AesCredentialCipher extends credential_cipher_1.CredentialCipher {
    key;
    constructor(config) {
        super();
        this.key = Buffer.from(config.getOrThrow('CREDENTIALS_ENCRYPTION_KEY'), 'base64');
        if (this.key.length !== KEY_BYTES) {
            throw new Error('CREDENTIALS_ENCRYPTION_KEY debe ser de 32 bytes en base64');
        }
    }
    encrypt(credentials) {
        const iv = (0, node_crypto_1.randomBytes)(IV_BYTES);
        const cipher = (0, node_crypto_1.createCipheriv)('aes-256-gcm', this.key, iv);
        const body = Buffer.concat([cipher.update(JSON.stringify(credentials), 'utf8'), cipher.final()]);
        return [VERSION, iv, cipher.getAuthTag(), body].map((p) => (typeof p === 'string' ? p : p.toString('base64url'))).join('.');
    }
    decrypt(payload) {
        const [version, iv, tag, body] = payload.split('.');
        if (version !== VERSION || !iv || !tag || !body)
            throw new Error('Credenciales con formato desconocido');
        const decipher = (0, node_crypto_1.createDecipheriv)('aes-256-gcm', this.key, Buffer.from(iv, 'base64url'));
        decipher.setAuthTag(Buffer.from(tag, 'base64url'));
        const plain = Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]);
        return JSON.parse(plain.toString('utf8'));
    }
};
exports.AesCredentialCipher = AesCredentialCipher;
exports.AesCredentialCipher = AesCredentialCipher = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AesCredentialCipher);
//# sourceMappingURL=aes-credential.cipher.js.map