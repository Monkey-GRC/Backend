"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessKeyCode = generateAccessKeyCode;
exports.normalizeAccessKeyCode = normalizeAccessKeyCode;
const node_crypto_1 = require("node:crypto");
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const PREFIX = 'MNK';
function generateAccessKeyCode() {
    const body = Array.from({ length: 12 }, () => ALPHABET[(0, node_crypto_1.randomInt)(ALPHABET.length)]).join('');
    return `${PREFIX}-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8)}`;
}
function normalizeAccessKeyCode(code) {
    return code.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(new RegExp(`^${PREFIX}`), '');
}
//# sourceMappingURL=access-key-code.js.map