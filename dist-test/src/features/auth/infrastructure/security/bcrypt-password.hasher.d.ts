import { PasswordHasher } from '../../domain/ports/password-hasher';
export declare class BcryptPasswordHasher extends PasswordHasher {
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
    compareAgainstDummy(plain: string): Promise<void>;
}
