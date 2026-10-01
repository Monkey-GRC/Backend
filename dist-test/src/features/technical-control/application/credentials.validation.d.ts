import { ConnectionCategory } from '../../../common/catalogs/technical-catalogs';
import { FieldError } from '../../../common/errors/validation.exception';
export type NormalizedCredentials = {
    errors: FieldError[];
    toStore: Record<string, unknown> | null;
};
export declare function normalizeCredentials(category: ConnectionCategory, raw: unknown): NormalizedCredentials;
