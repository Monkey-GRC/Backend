export type CreateReasonInput = {
  name: string;
  description?: string;
  userId: string;
};

export type UpdateReasonInput = {
  name?: string;
  description?: string;
  userId: string;
};

export abstract class ReasonRepository {
  abstract findAll(): Promise<any[]>;
  abstract findOne(id: string): Promise<any>;
  abstract create(input: CreateReasonInput): Promise<any>;
  abstract update(id: string, input: UpdateReasonInput): Promise<any>;
  abstract delete(id: string): Promise<any>;
  abstract attachRisks(reasonId: string, riskIds: string[]): Promise<any>;
  abstract detachRisk(reasonId: string, riskId: string): Promise<any>;
  abstract attachControls(reasonId: string, controlIds: string[]): Promise<any>;
  abstract detachControl(reasonId: string, controlId: string): Promise<any>;
}
