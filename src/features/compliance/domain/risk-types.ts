// Valores de riesgos y causas (contracts/enums.md). Las listas son las del comité (hoja Riesgos y hoja Causas).
export const RISK_CRITERIA = ['confidentiality', 'integrity', 'availability', 'privacy', 'compliance', 'security', 'continuity', 'third_parties', 'fraud', 'reputation', 'operations'] as const;
export const FAILURE_CATEGORIES = ['human_resource', 'processes', 'information_technology', 'infrastructure', 'external', 'governance'] as const;
export const RISK_LEVELS = ['low', 'moderate', 'high', 'critical'] as const;
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

/** El nivel de un riesgo según su valor (probabilidad × impacto): Bajo 1–4 · Moderado 5–9 · Alto 10–16 · Crítico 17–25. */
export function riskLevelOf(value: number): (typeof RISK_LEVELS)[number] {
  if (value <= 4) return 'low';
  if (value <= 9) return 'moderate';
  if (value <= 16) return 'high';
  return 'critical';
}

/** El siguiente código libre de una serie: `R011` después de `R010`, `F057` después de `F056`. */
export function nextCode(prefix: string, used: readonly string[]): string {
  const re = new RegExp(`^${prefix}(\\d+)$`);
  const max = Math.max(0, ...used.map((c) => Number(re.exec(c)?.[1] ?? 0)));
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}
