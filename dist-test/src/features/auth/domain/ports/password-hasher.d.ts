export declare abstract class PasswordHasher {
    abstract hash(plain: string): Promise<string>;
    abstract compare(plain: string, hash: string): Promise<boolean>;
    abstract compareAgainstDummy(plain: string): Promise<void>;
}
