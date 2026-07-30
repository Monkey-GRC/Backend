export type CreateUserInput = {
  email: string;
  username: string;
  password: string;
  name?: string;
  last_name?: string;
};

export type UpdateUserInput = {
  email?: string;
  username?: string;
  password?: string;
  name?: string;
  last_name?: string;
  is_active?: boolean;
};

export abstract class UserRepository {
  abstract findAll(): Promise<any[]>;
  abstract findOne(id: string): Promise<any>;
  abstract create(input: CreateUserInput): Promise<any>;
  abstract update(id: string, input: UpdateUserInput): Promise<any>;
  abstract delete(id: string): Promise<any>;
}
