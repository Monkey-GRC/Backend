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
  abstract create(input: CreateReasonInput): Promise<any>;
  abstract update(id: string, input: UpdateReasonInput): Promise<any>;
  abstract delete(id: string): Promise<any>;
}
