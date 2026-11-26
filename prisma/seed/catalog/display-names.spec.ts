import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CLIENT_VISIBLE_TEXT_FIELDS, clientVisibleTexts, displayDescriptionOf, displayNameOf, namesProvider, whiteLabel } from './display-names';
import { CatalogV2 } from './types';

describe('marca blanca (tabla 9)', () => {
  it.each([
    ['Agente Wazuh activo', 'Agente de la sonda activo'],
    ['agente Wazuh activo', 'agente de la sonda activo'],
    ['el agente de Wazuh', 'el agente de la sonda'],
    ['Wazuh SCA del servidor', 'evaluación de configuración de la sonda del servidor'],
    ['el módulo de Wazuh', 'el módulo de la sonda'],
    ['Syscollector reporta paquetes', 'inventario de la sonda reporta paquetes'],
    ['con Prowler se evalúa', 'con el motor de nube se evalúa'],
    ['los resultados de Prowler', 'los resultados del motor de nube'],
    ['se conecta a Prowler', 'se conecta al motor de nube'],
    ['Wazuh + Prowler', 'Sonda y motor de nube'],
    ['usa Wazuh + Prowler', 'usa sonda y motor de nube'],
    ['usa Wazuh/OSSEC, Tripwire', 'usa la sonda/OSSEC, Tripwire'],
    ['Posible Checks Wazuh', 'Verificaciones automáticas de la sonda'],
    ['Posible Checks Prowler', 'Verificaciones automáticas del motor de nube'],
    ['Wazuh detecta intrusiones', 'La sonda detecta intrusiones'],
  ])('%s → %s', (from, to) => {
    expect(whiteLabel(from)).toBe(to);
  });

  it('nada de lo que sale nombra al proveedor, aunque el texto lo repita', () => {
    const t = 'Wazuh y Prowler; agentes Wazuh; Wazuh SCA; módulos de Wazuh; Prowler v5; de Prowler. Syscollector y WAZUH.';
    expect(namesProvider(t)).toBe(true);
    expect(namesProvider(whiteLabel(t))).toBe(false);
  });
});

describe('nombre y descripción que ve el cliente', () => {
  const base = { code: 'T-CAP-1-01', documentName: null, requirementText: 'Inventario de activos del servicio', objective: 'Que los activos están en el inventario.' };

  it('una T-DOC se llama como su documento', () => {
    expect(displayNameOf({ ...base, code: 'T-DOC-POL001', documentName: 'Política de seguridad', requirementText: 'otro' })).toBe('Política de seguridad');
  });

  it('una prueba de control se llama como el texto de su requisito', () => {
    expect(displayNameOf(base)).toBe('Inventario de activos del servicio');
  });

  it('si el requisito es «Posible Checks …», se usa el objetivo', () => {
    expect(displayNameOf({ ...base, requirementText: 'Posible Checks Wazuh' })).toBe(base.objective);
    expect(displayNameOf({ ...base, requirementText: 'Posible Checks Prowler', objective: 'Que Prowler evalúa la nube.' })).toBe('Que el motor de nube evalúa la nube.');
  });

  it('sin requisito, el objetivo', () => {
    expect(displayNameOf({ ...base, requirementText: null })).toBe(base.objective);
  });

  it('la descripción es el objetivo con la tabla 9', () => {
    expect(displayDescriptionOf('Que Wazuh detecta cambios en los archivos.')).toBe('Que la sonda detecta cambios en los archivos.');
  });
});

describe('libro del comité (catalog-v2.json) y marca blanca', () => {
  const catalog = JSON.parse(readFileSync(join(__dirname, '../data/catalog-v2.json'), 'utf8')) as CatalogV2;

  it('recorre los campos de prosa del libro', () => {
    const wheres = clientVisibleTexts(catalog).map((x) => x.where);
    for (const [coll, fields] of Object.entries(CLIENT_VISIBLE_TEXT_FIELDS)) {
      for (const f of fields as readonly string[]) {
        expect([`${coll}.${f}`, wheres.some((w) => w.startsWith(`${coll}[`) && w.endsWith(`].${f}`))]).toEqual([`${coll}.${f}`, true]);
      }
    }
  });

  it('la tabla 9 es idempotente sobre todo el libro', () => {
    for (const { text } of clientVisibleTexts(catalog)) expect(whiteLabel(whiteLabel(text))).toBe(whiteLabel(text));
  });

  it('clientVisibleTexts no lanza si falta una colección', () => {
    expect(clientVisibleTexts({} as CatalogV2)).toEqual([]);
  });

  it('ningún texto visible al cliente nombra al proveedor tras la tabla 9', () => {
    const leaks = clientVisibleTexts(catalog).filter((x) => namesProvider(whiteLabel(x.text))).map((x) => x.where);
    expect(leaks).toEqual([]);
  });
});
