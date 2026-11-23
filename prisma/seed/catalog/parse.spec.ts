import { leadingNumber, normalizeSoc2Requirement, ownerControlOf, parseRequirementRef, pointOfL, splitKnown, splitList, text, tscPrefix } from './parse';

describe('analizadores del libro', () => {
  it('text normaliza los saltos de línea de Excel y recorta', () => {
    expect(text('  a\r\nb \r')).toBe('a\nb');
    expect(text(null)).toBe('');
    expect(text(34792)).toBe('34792');
  });

  it('splitList parte por el separador de la columna y descarta vacíos (DEV-05)', () => {
    expect(splitList('POL-001; PRO-022', ';')).toEqual(['POL-001', 'PRO-022']);
    expect(splitList('F019, F038 ,F096,', ',')).toEqual(['F019', 'F038', 'F096']);
    expect(splitList(null, ';')).toEqual([]);
  });

  it('splitKnown respeta un valor conocido que contiene el separador («Logs, SIEM y monitoreo»)', () => {
    expect(splitKnown('Logs, SIEM y monitoreo, Nube', ',', ['Logs, SIEM y monitoreo', 'Nube'])).toEqual(['Logs, SIEM y monitoreo', 'Nube']);
    expect(splitKnown('Nube, Ticketing', ',', ['Nube', 'Ticketing'])).toEqual(['Nube', 'Ticketing']);
  });

  it('«4 - Probable» → 4; sin número inicial → null', () => {
    expect(leadingNumber('4 - Probable')).toBe(4);
    expect(leadingNumber('5 - Casi seguro')).toBe(5);
    expect(leadingNumber('Probable')).toBeNull();
  });

  it('«L3» → 3 y «A1.1 POC 2» → criterio + punto', () => {
    expect(pointOfL('L12')).toBe(12);
    expect(pointOfL('Documento')).toBeNull();
    expect(parseRequirementRef('CC8.1 POC 14')).toEqual({ requirementCode: 'CC8.1', pointNumber: 14 });
    expect(parseRequirementRef('CC8.1')).toBeNull();
  });

  it('el dueño de una dependencia sale del objetivo común', () => {
    expect(ownerControlOf('Cambios en archivos críticos detectados (dueño MNT-3)')).toBe('MNT-3');
    expect(ownerControlOf('Inventario automático (dueño ACT-3)')).toBe('ACT-3');
    expect(ownerControlOf('Sin dueño')).toBeNull();
  });

  it('el prefijo de un criterio TSC', () => {
    expect(['CC6.1', 'PI1.2', 'A1.1', 'C1.1', 'P4.2', 'X'].map(tscPrefix)).toEqual(['CC', 'PI', 'A', 'C', 'P', null]);
  });

  it('el motor de nube escribe SOC 2 como cc_6_7: se normaliza a CC6.7', () => {
    expect(normalizeSoc2Requirement('cc_6_7')).toBe('CC6.7');
    expect(normalizeSoc2Requirement('cc_a_1_1')).toBe('A1.1');
    expect(normalizeSoc2Requirement('cc_c_1_2')).toBe('C1.2');
    expect(normalizeSoc2Requirement('pi_1_3')).toBe('PI1.3');
    expect(normalizeSoc2Requirement('p_1')).toBeNull();
  });
});
