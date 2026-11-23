import { owner } from './app';

// En el catálogo v2 todo control lleva varias pruebas (las T-DOC de sus documentos y las suyas), así que ninguno tiene «una sola prueba documental».
// Estas pruebas necesitan esa forma: crean un control PROPIO del servicio (como los que crea la empresa, D79) con exactamente las pruebas pedidas.
export async function controlPropioConPruebas(companyId: string, serviceId: string, ownCode: string, testIds: string[], dimension = 'policy'): Promise<string> {
  const [control] = await owner<{ id: string }>(
    `insert into tenant.client_controls (id, tenant_id, service_id, own_code, name, trust_criterion, client_interpretation, type)
     values (gen_random_uuid(), $1, $2, $3, $4, 'security', 'Control de prueba', 'manual') returning id`,
    [companyId, serviceId, ownCode, `Control de prueba ${ownCode}`],
  );
  await owner(
    `insert into tenant.client_control_dimensions (id, tenant_id, client_control_id, dimension, type) values (gen_random_uuid(), $1, $2, $3::catalog.dimension, 'manual')`,
    [companyId, control.id, dimension],
  );
  for (const testId of testIds) {
    await owner(`insert into tenant.client_control_tests (id, tenant_id, client_control_id, test_id) values (gen_random_uuid(), $1, $2, $3)`, [companyId, control.id, testId]);
  }
  return control.id;
}
