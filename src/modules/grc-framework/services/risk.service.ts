import { Injectable } from "@nestjs/common";
import { Prisma, RiskLevel } from "generated/prisma/browser";
import { obfuscateSeq } from "src/common/utils/obfuscate-code";
import { PrismaService } from "src/infrastructure/database/prisma.service";

@Injectable()
export class RiskService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    getAllRisks() {
        return this.prisma.risk.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                impact: true,
                probability: true,
                level: true,
                created_by_user: {
                    select: {
                        id: true,
                        name: true,
                        last_name: true,
                        role: true,
                        username: true,
                    }
                },
                updated_by_user: true,
                created_at: true,
                updated_at: true,
            }
        });
    }

    async createRisk(
        data: Omit<Prisma.RiskCreateInput, 'code' | 'level'>
    ) {
        // 1️⃣ Calcular score del riesgo (impacto + probabilidad)
        const score = data.impact + data.probability;

        // 2️⃣ Determinar nivel según score (matriz simple)
        const level: RiskLevel = this.calculateRiskLevel(score);

        // 3️⃣ Transacción para asegurar consistencia
        return this.prisma.$transaction(async (tx) => {
            // Crear el riesgo (seq autogenerado por BD)
            const risk = await tx.risk.create({
                data: {
                    ...data,
                    level,
                    code: 'PENDING', // placeholder temporal, se reemplaza inmediatamente
                },
            });

            // 4️⃣ Generar código no predecible basado en seq
            const code = `RGS-${obfuscateSeq(risk.seq)}`;

            // 5️⃣ Actualizar el código
            return tx.risk.update({
                where: { id: risk.id },
                data: { code },
            });
        });
    }


    updateRisk(id: string, data: Prisma.RiskUpdateInput) {
        return this.prisma.risk.update({
            where: { id },
            data
        });
    }

    deleteRisk(id: string) {
        return this.prisma.risk.delete({
            where: { id }
        });
    }

    // Función auxiliar para determinar nivel de riesgo
    private calculateRiskLevel(score: number): RiskLevel {
        if (score >= 8) return 'CRITICAL';
        if (score >= 6) return 'HIGH';
        if (score >= 4) return 'MEDIUM';
        return 'LOW';
    }

}