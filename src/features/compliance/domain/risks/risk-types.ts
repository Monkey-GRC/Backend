// Valores de riesgos y causas (contracts/enums.md). Las listas son las del comité (hoja Riesgos y hoja Causas).
export const RISK_CRITERIA = ['confidentiality', 'integrity', 'availability', 'privacy', 'compliance', 'security', 'continuity', 'third_parties', 'fraud', 'reputation', 'operations'] as const;
export const FAILURE_CATEGORIES = ['human_resource', 'processes', 'information_technology', 'infrastructure', 'external', 'governance'] as const;
export const RISK_LEVELS = ['low', 'moderate', 'high', 'critical'] as const;
export const TREATMENT_DECISIONS = ['mitigate', 'accept', 'transfer', 'avoid'] as const;
export const CAUSE_CONTROL_EFFECTS = ['probability', 'impact'] as const;

export const LOSS_TYPES = ['reputational', 'financial_loss', 'regulatory_sanction', 'litigation', 'customer_trust_loss', 'operation_interruption'] as const;
export type LossType = (typeof LOSS_TYPES)[number];

// El catálogo guarda el impacto potencial como texto en español, tal como lo trae el comité. La API habla en valores (`loss_type`). Se convierte en los dos
// sentidos y lo que se guarda sigue siendo ese texto, para que el catálogo y lo que crea la empresa tengan un solo formato.
// El Excel trae dos variantes de la última («…de la operación» y «…o cierre de la operación»): se leen como una (`P9`).
const LABEL_OF: Record<LossType, string> = {
  reputational: 'Reputacional',
  financial_loss: 'Pérdida financiera',
  regulatory_sanction: 'Sanción regulatoria',
  litigation: 'Litigios',
  customer_trust_loss: 'Pérdida de confianza de clientes',
  operation_interruption: 'Interrupción de la operación',
};
const ALIASES: Record<string, LossType> = { 'Interrupción o cierre de la operación': 'operation_interruption' };
const VALUE_OF = new Map<string, LossType>([...(Object.entries(LABEL_OF) as Array<[LossType, string]>).map(([v, l]) => [l, v] as [string, LossType]), ...Object.entries(ALIASES)]);

/** Del texto guardado a los valores de la API. Un texto que no se reconoce se omite de la respuesta (no se pierde: sigue guardado). */
export function lossTypesOf(stored: unknown): LossType[] {
  if (!Array.isArray(stored)) return [];
  const values = stored.map((s) => (typeof s === 'string' ? VALUE_OF.get(s.trim()) : undefined)).filter((v): v is LossType => !!v);
  return [...new Set(values)];
}

/** De los valores de la API al texto que se guarda. */
export const storedLossTypes = (values: readonly LossType[]): string[] => [...new Set(values)].map((v) => LABEL_OF[v]);

/** La matriz es de 5×5: probabilidad e impacto van de 1 a 5 (D33). */
export const RISK_SCALE = { min: 1, max: 5 } as const;

/** El valor de un riesgo es probabilidad × impacto; lo calcula el servidor, el cliente nunca. */
export const riskValueOf = (likelihood: number, impact: number): number => likelihood * impact;

/**
 * El nivel sale de la casilla de la matriz (probabilidad, impacto), no de rangos del valor (D134). Filas: probabilidad 1..5; columnas: impacto 1..5.
 * Si cambia, cambia también el CHECK `client_risks_evaluation_shape` (migración MD-496).
 */
const L = 'low', M = 'moderate', H = 'high', C = 'critical';
const LEVEL_BY_CELL: ReadonlyArray<ReadonlyArray<(typeof RISK_LEVELS)[number]>> = [
  [L, L, M, H, H],
  [L, L, M, H, C],
  [L, M, H, C, C],
  [M, H, H, C, C],
  [H, H, C, C, C],
];

/** El nivel de un riesgo según su casilla (D134). */
export const riskLevelAt = (likelihood: number, impact: number): (typeof RISK_LEVELS)[number] => LEVEL_BY_CELL[likelihood - RISK_SCALE.min][impact - RISK_SCALE.min];

export type RiskMatrixCell = { likelihood: number; impact: number; value: number; level: (typeof RISK_LEVELS)[number] };

/**
 * La matriz completa: cada casilla (probabilidad × impacto) con su valor y el nivel de la tabla (D134). Es la misma función que usa la evaluación de un riesgo, así que lo
 * que la pantalla pinta en una casilla vacía es exactamente el nivel que tendría un riesgo evaluado ahí. De mayor a menor probabilidad no importa: la ordena el cliente.
 */
export function riskMatrix(): { min: number; max: number; cells: RiskMatrixCell[] } {
  const cells: RiskMatrixCell[] = [];
  for (let likelihood = RISK_SCALE.min; likelihood <= RISK_SCALE.max; likelihood++) {
    for (let impact = RISK_SCALE.min; impact <= RISK_SCALE.max; impact++) {
      const value = riskValueOf(likelihood, impact);
      cells.push({ likelihood, impact, value, level: riskLevelAt(likelihood, impact) });
    }
  }
  return { min: RISK_SCALE.min, max: RISK_SCALE.max, cells };
}

/** El siguiente código libre de una serie: `R011` después de `R010`, `F057` después de `F056`. */
export function nextCode(prefix: string, used: readonly string[]): string {
  const re = new RegExp(`^${prefix}(\\d+)$`);
  const max = Math.max(0, ...used.map((c) => Number(re.exec(c)?.[1] ?? 0)));
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}
