import { obfuscateSeq } from 'src/common/utils/obfuscate-code';

export class ControlEntity {
    static generateCode(seq: number): string {
        return `CTR-${obfuscateSeq(seq)}`;
    }
}
