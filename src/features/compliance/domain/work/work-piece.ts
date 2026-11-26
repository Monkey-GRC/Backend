import { evidenceAcceptanceOf, ConnectedIntegrationCategories, EvidenceSourceTest } from '../evidence/test-evidence-source';
/** Los tipos de dimensión que el control resuelve a mano (`catalog.control_dimension_type`); `hybrid` y `automated` los mide la sonda. */
const isManualDimensionType = (type: string): boolean => type === 'manual' || type === 'technical_manual';

/**
 * MD-499 · De qué cuenta una prueba en «Mi trabajo»: de una EVIDENCIA si acepta subida (la regla única `evidenceAcceptanceOf`, por fuente principal y dimensión aplicable) o de un VEREDICTO si
 * no la acepta y el control la resuelve a mano (D85). La documental nunca lleva veredicto (D88). Una prueba que ninguna de las dos mide (sonda, nube, integración conectada) no es pieza.
 */
export type WorkPiece = 'evidence' | 'verdict';

export function workPieceOf(
  test: EvidenceSourceTest & { dimension: string }, dimension: { applies: boolean; type: string } | undefined, connected: ConnectedIntegrationCategories,
): WorkPiece | null {
  const applies = dimension?.applies ?? false;
  if (evidenceAcceptanceOf(test, connected, applies).accepts) return 'evidence';
  return applies && test.dimension !== 'policy' && isManualDimensionType(dimension?.type ?? '') ? 'verdict' : null;
}
