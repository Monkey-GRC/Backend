import { clientText, namesProvider, publicText, whiteLabel } from './provider-names';

describe('tabla 9 (marca blanca)', () => {
  it.each([
    ['Agente Wazuh activo', 'Agente de la sonda activo'],
    ['el agente de Wazuh', 'el agente de la sonda'],
    ['Wazuh SCA del servidor', 'evaluación de configuración de la sonda del servidor'],
    ['con Prowler se evalúa', 'con el motor de nube se evalúa'],
    ['se conecta a Prowler', 'se conecta al motor de nube'],
    ['Wazuh + Prowler', 'Sonda y motor de nube'],
    ['usa Wazuh/OSSEC, Tripwire', 'usa la sonda/OSSEC, Tripwire'],
    ['Posible Checks Wazuh', 'Verificaciones automáticas de la sonda'],
    ['Posible Checks wazuh', 'Verificaciones automáticas de la sonda'],
    ['Posibles check de Prowler', 'Verificaciones automáticas del motor de nube'],
    ['lista de agentes de Wazuh, listado', 'lista de agentes de la sonda, listado'],
    ['revise el FIM de Wazuh activo', 'revise el FIM de la sonda activo'],
    ['alternativa a Wazuh FIM)', 'alternativa a FIM de la sonda)'],
    ['basada en host activa (Wazuh HIDS)', 'basada en host activa (HIDS de la sonda)'],
    ['(Wazuh FIM u otro equivalente)', '(FIM de la sonda u otro equivalente)'],
    ['mediante Wazuh (Syscollector) o el MDM', 'mediante la sonda (inventario) o el MDM'],
    ['(Syscollector)', '(inventario de la sonda)'],
    ['inventario de Syscollector', 'inventario de la sonda'],
    ['paquetes de Syscollector a la fecha', 'paquetes del inventario de la sonda a la fecha'],
    ['BD sin política Wazuh', 'BD sin política de la sonda'],
    ['motores sin política de Wazuh', 'motores sin política de la sonda'],
    ['(en Monkey se cubre con Prowler)', '(en Monkey se cubre con el motor de nube)'],
    ['catálogo de Prowler v5.45.0', 'catálogo del motor de nube v5.45.0'],
    ['Exportación fechada de Prowler y Wazuh', 'Exportación fechada del motor de nube y la sonda'],
    ['Wazuh y Prowler no cubren', 'La sonda y el motor de nube no cubren'],
    ['con un check de Wazuh o de Prowler.', 'con un check de la sonda o del motor de nube.'],
    ['Hecho. Wazuh no cubre', 'Hecho. La sonda no cubre'],
    ['1- Exporte de Wazuh la lista\n2- Prowler lista', '1- Exporte de la sonda la lista\n2- El motor de nube lista'],
    ['usa Wazuh Syscollector', 'usa inventario de la sonda'],
    ['si el Wazuh detecta', 'si la sonda detecta'],
    ['lo del Wazuh', 'lo de la sonda'],
    ['un Wazuh propio', 'una sonda propio'],
    ['si el Prowler activo', 'si el motor de nube activo'],
    ['del Prowler activo', 'del motor de nube activo'],
    ['un Prowler activo', 'un motor de nube activo'],
    ['Wazuh detecta intrusiones', 'La sonda detecta intrusiones'],
  ])('%s → %s', (from, to) => {
    expect(whiteLabel(from)).toBe(to);
  });

  it('es idempotente', () => {
    for (const x of ['Wazuh y Prowler; el Wazuh; del Prowler', 'Exporte de Wazuh (Syscollector) y FIM de Wazuh', 'Posible Checks Prowler']) expect(whiteLabel(whiteLabel(x))).toBe(whiteLabel(x));
  });

  it('no toca OSSEC ni AIDE', () => {
    expect(whiteLabel('OSSEC y AIDE')).toBe('OSSEC y AIDE');
  });

  it('clientText aplica la tabla 9 y publicText descarta lo que aún nombra al proveedor', () => {
    expect(clientText('Exporte de Prowler el informe')).toBe('Exporte del motor de nube el informe');
    expect(clientText(null)).toBeNull();
    expect(publicText('Prowler')).toBeNull();
    expect(namesProvider(whiteLabel('WAZUH y PROWLER'))).toBe(false);
  });
});
