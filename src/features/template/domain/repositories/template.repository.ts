export type CreateTemplateInput = {
    name: string;
    description?: string;
    objective?: string;
    scope?: string;
    slug: string;
    userId: string;
};

export type UpdateTemplateInput = {
    name?: string;
    description?: string;
    objective?: string;
    scope?: string;
    slug?: string;
    userId: string;
};

export abstract class TemplateRepository {
    abstract findAll(): Promise<any[]>;
    abstract findOne(id: string): Promise<any>;
    abstract create(input: CreateTemplateInput): Promise<any>;
    abstract update(id: string, input: UpdateTemplateInput): Promise<any>;
    abstract delete(id: string): Promise<any>;
}
