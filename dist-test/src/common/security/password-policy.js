"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_MIN_LENGTH = void 0;
exports.meetsPasswordPolicy = meetsPasswordPolicy;
exports.PASSWORD_MIN_LENGTH = 12;
function meetsPasswordPolicy(password) {
    return (password.length >= exports.PASSWORD_MIN_LENGTH &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(password));
}
//# sourceMappingURL=password-policy.js.map