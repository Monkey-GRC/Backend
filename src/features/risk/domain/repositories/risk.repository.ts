export type CreateRiskInput = {
    name: string;
    description?: string;
    impact: number;
    probability: number;
    templateId?: string;
    userId: string;
};

export type UpdateRiskInput = {
    name?: string;
    description?: string;
    impact?: number;
    probability?: number;
    templateId?: string | null;
    userId: string;
};

export abstract class RiskRepository {
    abstract findAll(): Promise<any[]>;
    abstract findOne(id: string): Promise<any>;
    abstract create(input: CreateRiskInput): Promise<any>;
    abstract update(id: string, input: UpdateRiskInput): Promise<any>;
    abstract delete(id: string): Promise<any>;
}
