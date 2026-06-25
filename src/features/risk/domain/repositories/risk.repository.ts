export type CreateRiskInput = {
    name: string;
    description?: string;
    impact: number;
    probability: number;
    userId: string;
};

export type UpdateRiskInput = {
    name?: string;
    description?: string;
    impact?: number;
    probability?: number;
    userId: string;
};

export abstract class RiskRepository {
    abstract findAll(): Promise<any[]>;
    abstract create(input: CreateRiskInput): Promise<any>;
    abstract update(id: string, input: UpdateRiskInput): Promise<any>;
    abstract delete(id: string): Promise<any>;
}
