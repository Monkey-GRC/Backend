import { obfuscateSeq } from 'src/common/utils/obfuscate-code';

export class AssetEntity {
    static generateCode(seq: number): string {
        return `AST-${obfuscateSeq(seq)}`;
    }
}
