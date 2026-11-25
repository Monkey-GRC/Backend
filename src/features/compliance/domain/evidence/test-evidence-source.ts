// MD-499 · Una sola regla para «¿esta prueba se respalda con una evidencia que sube el cliente?». Se decide por la FUENTE PRINCIPAL de la prueba (`tests.primary_source`), no por
// su dimensión. La usan la subida (POST …/tests/{test_id}/evidence), los requerimientos propios y los campos `accepts_evidence` y `evidence_fallback` del detalle del control.
//   · `document` y `manual` → aceptan subida.
//   · `probe`, `cloud_engine` y `probe_and_cloud_engine` → no: las mide la evaluación automática.
//   · `integration` → acepta subida DE RESPALDO solo mientras el servicio no tenga conectada una integración de la categoría de la prueba.
// El respaldo se calcula cada vez (no se guarda ninguna marca): al conectar la integración las evidencias subidas quedan de histórico y desde ahí decide la integración;
// si se desconecta, vuelve a aceptar subida.
export type EvidenceSourceTest = { primarySource?: string | null; integrationCategory?: string | null };
export type EvidenceAcceptance = { accepts: boolean; fallback: boolean };

/** Las categorías de integración que el servicio tiene conectadas, por nombre (`catalog.integration_categories.name`). */
export type ConnectedIntegrationCategories = ReadonlySet<string>;
export const NO_INTEGRATIONS: ConnectedIntegrationCategories = new Set<string>();

const MANUAL_SOURCES: readonly string[] = ['document', 'manual'];

/**
 * `dimensionApplies`: la dimensión de la prueba aplica en el control; una marcada «no aplica» no acepta subida (la prueba no se evalúa ahí).
 * Una prueba sin fuente (v1) se trata como manual: es lo que el catálogo asigna por defecto.
 */
export function evidenceAcceptanceOf(test: EvidenceSourceTest, connected: ConnectedIntegrationCategories = NO_INTEGRATIONS, dimensionApplies = true): EvidenceAcceptance {
  if (!dimensionApplies) return { accepts: false, fallback: false };
  const source = test.primarySource ?? 'manual';
  if (MANUAL_SOURCES.includes(source)) return { accepts: true, fallback: false };
  if (source === 'integration') {
    const covered = test.integrationCategory != null && connected.has(test.integrationCategory);
    return { accepts: !covered, fallback: !covered };
  }
  return { accepts: false, fallback: false };
}

export const acceptsEvidence = (test: EvidenceSourceTest, connected: ConnectedIntegrationCategories = NO_INTEGRATIONS, dimensionApplies = true): boolean => evidenceAcceptanceOf(test, connected, dimensionApplies).accepts;

/** Por qué no se puede subir evidencia de una prueba en un control (el código del 422), o `null` si se puede. Primero aplica la dimensión, después acepta la fuente. */
export type EvidenceBlock = 'dimension.not_in_control' | 'test.not_manual';
export function evidenceBlockOf(test: EvidenceSourceTest, connected: ConnectedIntegrationCategories, dimensionApplies: boolean): EvidenceBlock | null {
  if (!dimensionApplies) return 'dimension.not_in_control';
  return acceptsEvidence(test, connected) ? null : 'test.not_manual';
}
