import { owner } from './app';

// En el catálogo v2 todo control lleva varias pruebas (las T-DOC de sus documentos y las suyas), así que ninguno tiene «una sola prueba documental».
// Estas pruebas necesitan esa forma: crean un control PROPIO del servicio (como los que crea la empresa, D79) con exactamente las pruebas pedidas.
export async function controlPropioConPruebas(companyId: string, serviceId: string, ownCode: string, testIds: string[], dimension = 'policy', tipoDimension = 'manual'): Promise<string> {
  const [control] = await owner<{ id: string }>(
    `insert into tenant.client_controls (id, tenant_id, service_id, own_code, name, trust_criterion, client_interpretation, type)
     values (gen_random_uuid(), $1, $2, $3, $4, 'security', 'Control de prueba', 'manual') returning id`,
    [companyId, serviceId, ownCode, `Control de prueba ${ownCode}`],
  );
  await owner(
    `insert into tenant.client_control_dimensions (id, tenant_id, client_control_id, dimension, type) values (gen_random_uuid(), $1, $2, $3::catalog.dimension, $4::catalog.control_dimension_type)`,
    [companyId, control.id, dimension, tipoDimension],
  );
  for (const testId of testIds) {
    await owner(`insert into tenant.client_control_tests (id, tenant_id, client_control_id, test_id) values (gen_random_uuid(), $1, $2, $3)`, [companyId, control.id, testId]);
  }
  return control.id;
}

/** MD-499 · El `status` de una prueba (`test_status`) en el lenguaje del veredicto y de la evidencia: `compliant` o `non_compliant`; lo demás (`pending`, `expired`…) queda igual. */
export const resultadoDeStatus = (status: string): string => (status === 'exception' ? 'non_compliant' : status === 'correct' || status === 'observation' ? 'compliant' : status);

/**
 * MD-499 · El API ya no trae `technical.control_state`: el evento `control.state` sigue guardando ese estado, así que las pruebas lo derivan del detalle técnico con la regla del contrato
 * (Adecuado o Sólido → effective · algún requisito No cumple → ineffective · algún Vencido → expired · sin requisitos aplicables → no_tests · si no, evaluating).
 */
export function controlStateOf(technical: { complies: boolean; requirements: Array<{ status: string }> }): string {
  const applicable = technical.requirements.filter((r) => r.status !== 'not_applicable');
  if (applicable.length === 0) return 'no_tests';
  if (technical.complies) return 'effective';
  if (applicable.some((r) => r.status === 'non_compliant')) return 'ineffective';
  if (applicable.some((r) => r.status === 'expired')) return 'expired';
  return 'evaluating';
}
