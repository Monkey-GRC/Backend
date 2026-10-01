export type IsolationStrategy = 'dedicated' | 'shared';
export type CompanyStatus = 'active' | 'suspended';
export declare class Company {
    readonly id: string;
    readonly name: string;
    readonly adminEmail: string;
    readonly isolationStrategy: IsolationStrategy;
    readonly status: CompanyStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, name: string, adminEmail: string, isolationStrategy: IsolationStrategy, status: CompanyStatus, createdAt: Date, updatedAt: Date);
    static normalizeName(name: string): string;
    static normalizeEmail(email: string): string;
    static isolationFor(requiresDedicatedDatabase: boolean): IsolationStrategy;
}
