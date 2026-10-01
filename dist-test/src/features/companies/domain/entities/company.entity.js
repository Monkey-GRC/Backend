"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
class Company {
    id;
    name;
    adminEmail;
    isolationStrategy;
    status;
    createdAt;
    updatedAt;
    constructor(id, name, adminEmail, isolationStrategy, status, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.adminEmail = adminEmail;
        this.isolationStrategy = isolationStrategy;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static normalizeName(name) {
        return name.trim().replace(/\s+/g, ' ');
    }
    static normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    static isolationFor(requiresDedicatedDatabase) {
        return requiresDedicatedDatabase ? 'dedicated' : 'shared';
    }
}
exports.Company = Company;
//# sourceMappingURL=company.entity.js.map