import { evidenceAcceptanceOf, ConnectedIntegrationCategories, EvidenceSourceTest } from '../evidence/test-evidence-source';
/** Los tipos de dimensión que el control resuelve a mano (`catalog.control_dimension_type`); `hybrid` y `automated` los mide la sonda. */
const isManualDimensionType = (type: string): boolean => type === 'manual' || type === 'technical_manual';

/**
 * MD-499, MD-529 (DT-120) · De qué cuenta una prueba en «Mi trabajo»: de una EVIDENCIA si acepta subida (la regla única `evidenceAcceptanceOf`, por fuente principal y dimensión aplicable) y de un
 * RESULTADO que registra el responsable (D140 punto 2) si no es documental. Una prueba manual no documental que acepta subida lleva LAS DOS piezas; la que no acepta subida y el control resuelve a mano,
 * solo el resultado; la documental, solo la evidencia (D88). Una prueba que ninguna mide (sonda, nube, integración conectada) no es pieza.
 */
export type WorkPiece = 'evidence' | 'result';

export function workPiecesOf(
  test: EvidenceSourceTest & { dimension: string; type?: string | null }, dimension: { applies: boolean; type: string } | undefined, connected: ConnectedIntegrationCategories,
): WorkPiece[] {
  const applies = dimension?.applies ?? false;
  if (evidenceAcceptanceOf(test, connected, applies).accepts) return test.type === 'documentary' ? ['evidence'] : ['evidence', 'result'];
  return applies && test.dimension !== 'policy' && isManualDimensionType(dimension?.type ?? '') ? ['result'] : [];
}
