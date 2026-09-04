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

export type ContractedTemplate = { id: string; name: string };

export abstract class TemplateRepository {
  abstract findAll(): Promise<any[]>;
  /** Templates que este tenant adoptó desde central (source_template_id no nulo) — los frameworks realmente "contratados", para el resumen del Dashboard. */
  abstract findContracted(): Promise<ContractedTemplate[]>;
  abstract findOne(id: string): Promise<any>;
  abstract findFullTree(id: string): Promise<any>;
  abstract create(input: CreateTemplateInput): Promise<any>;
  abstract update(id: string, input: UpdateTemplateInput): Promise<any>;
  abstract delete(id: string): Promise<any>;
}
