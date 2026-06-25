import { ControlType } from 'generated/prisma/browser';

export type CreateControlInput = {
    name: string;
    description?: string;
    objective?: string;
    type?: ControlType;
    userId: string;
};

export type UpdateControlInput = {
    name?: string;
    description?: string;
    objective?: string;
    type?: ControlType;
    userId: string;
};

export abstract class ControlRepository {
    abstract findAll(): Promise<any[]>;
    abstract create(input: CreateControlInput): Promise<any>;
    abstract update(id: string, input: UpdateControlInput): Promise<any>;
    abstract delete(id: string): Promise<any>;
}
