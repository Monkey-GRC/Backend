"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationalContext = void 0;
class OrganizationalContext {
    id;
    name;
    description;
    size;
    industry;
    businessModel;
    yearsInOperation;
    incorporationCountries;
    clientCountries;
    complianceMaturity;
    regulations;
    constructor(id, name, description, size, industry, businessModel, yearsInOperation, incorporationCountries, clientCountries, complianceMaturity, regulations) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.size = size;
        this.industry = industry;
        this.businessModel = businessModel;
        this.yearsInOperation = yearsInOperation;
        this.incorporationCountries = incorporationCountries;
        this.clientCountries = clientCountries;
        this.complianceMaturity = complianceMaturity;
        this.regulations = regulations;
    }
    static empty(name) {
        return new OrganizationalContext(null, name, null, null, null, null, null, [], [], null, []);
    }
    get exists() {
        return this.id !== null;
    }
    get completion() {
        const requiredFilled = [
            true,
            !!this.description,
            !!this.size,
            !!this.industry,
            !!this.businessModel,
            this.incorporationCountries.length > 0,
            this.clientCountries.length > 0,
            !!this.complianceMaturity,
            this.regulations.length > 0,
        ].filter(Boolean).length;
        return {
            required_total: 9,
            required_filled: requiredFilled,
            optional_total: 1,
            optional_filled: this.yearsInOperation ? 1 : 0,
        };
    }
    get isComplete() {
        return this.completion.required_filled === this.completion.required_total;
    }
    snapshot() {
        return {
            id: this.id,
            description: this.description,
            size: this.size,
            industry: this.industry,
            business_model: this.businessModel,
            years_in_operation: this.yearsInOperation,
            incorporation_countries: this.incorporationCountries,
            client_countries: this.clientCountries,
            compliance_maturity: this.complianceMaturity,
            regulation_codes: this.regulations.map((r) => r.code),
        };
    }
}
exports.OrganizationalContext = OrganizationalContext;
//# sourceMappingURL=organizational-context.entity.js.map