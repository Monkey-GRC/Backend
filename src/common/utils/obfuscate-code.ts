export function obfuscateSeq(seq: number): string {
    const MULTIPLIER = 7919;   // número primo
    const OFFSET = 104729;     // primo grande
    const MOD = 1000000;       // 6 dígitos

    const value = (seq * MULTIPLIER + OFFSET) % MOD;
    return value.toString().padStart(6, '0');
}