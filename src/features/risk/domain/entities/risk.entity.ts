export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class RiskEntity {
    static calculateLevel(impact: number, probability: number): RiskLevel {
        const score = impact + probability;
        if (score >= 8) return 'CRITICAL';
        if (score >= 6) return 'HIGH';
        if (score >= 4) return 'MEDIUM';
        return 'LOW';
    }
}
