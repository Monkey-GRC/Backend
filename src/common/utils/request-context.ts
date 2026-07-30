import { AsyncLocalStorage } from 'node:async_hooks';
import { Role } from '../enums/role.enum';

export interface RequestStore {
  userId?: string;
  clientId?: string;
  role?: Role;
}

const als = new AsyncLocalStorage<RequestStore>();

export class RequestContext {
  static run<T>(store: RequestStore, fn: () => T): T {
    return als.run(store, fn);
  }

  static get userId(): string | undefined {
    return als.getStore()?.userId;
  }

  static get clientId(): string | undefined {
    return als.getStore()?.clientId;
  }

  static get role(): Role | undefined {
    return als.getStore()?.role;
  }
}
