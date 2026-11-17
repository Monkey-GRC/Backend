import { codeSegments, SourcePolicy, validateSondaTranslations } from './translations';

const source = new Map<string, SourcePolicy>([
  [
    'cis_ubuntu22-04',
    new Map([
      ['1', { remediation: 'Run the following command: # systemctl unmask tmp.mount  and then reboot.', remediationEs: null }],
      ['2', { remediation: 'Edit /etc/fstab and add the nodev option.', remediationEs: null }],
      ['3', { remediation: 'Texto ya traducido por el comité.', remediationEs: 'Ya existe.' }],
      ['4', { remediation: null, remediationEs: null }],
    ]),
  ],
]);
const file = (translations: { checkId: string; remediationEs: string }[]) => ({ policyId: 'cis_ubuntu22-04', translations });

describe('codeSegments', () => {
  it('toma cada línea de un bloque de código y el código en línea, sin espacios de más', () => {
    expect(codeSegments('Ejecute:\n```\nsystemctl   unmask   tmp.mount\nmount -o remount /tmp\n```\nY edite `/etc/fstab`.')).toEqual(['systemctl unmask tmp.mount', 'mount -o remount /tmp', '/etc/fstab']);
  });
});

describe('validateSondaTranslations (D113)', () => {
  it('acepta una traducción cuyos comandos aparecen igual en el original', () => {
    expect(validateSondaTranslations(file([{ checkId: '1', remediationEs: 'Ejecute el siguiente comando:\n```\nsystemctl unmask tmp.mount\n```\nY reinicie.' }, { checkId: '2', remediationEs: 'Edite `/etc/fstab` y agregue la opción nodev.' }]), source)).toEqual([]);
  });

  it('rechaza un comando que la traducción cambió o inventó (le haría daño al servidor del cliente)', () => {
    const out = validateSondaTranslations(file([{ checkId: '1', remediationEs: '```\nsystemctl mask tmp.mount\n```' }]), source);
    expect(out).toEqual([expect.stringContaining('no aparece igual en el original')]);
  });

  it('rechaza lo que no existe, lo repetido, lo vacío y un bloque sin cerrar', () => {
    const out = validateSondaTranslations(file([{ checkId: '99', remediationEs: 'x' }, { checkId: '1', remediationEs: 'a' }, { checkId: '1', remediationEs: 'b' }, { checkId: '2', remediationEs: '   ' }, { checkId: '2', remediationEs: '```\nsin cerrar' }]), source);
    expect(out.some((p) => p.includes('99: no existe'))).toBe(true);
    expect(out.some((p) => p.includes('1: repetido'))).toBe(true);
    expect(out.some((p) => p.includes('falta la guía'))).toBe(true);
    expect(out.some((p) => p.includes('sin cerrar'))).toBe(true);
  });

  it('no pisa lo que el comité ya trae en español ni traduce lo que no tiene original', () => {
    const out = validateSondaTranslations(file([{ checkId: '3', remediationEs: 'Otra' }, { checkId: '4', remediationEs: 'Otra' }]), source);
    expect(out.some((p) => p.includes('3: ya trae guía en español'))).toBe(true);
    expect(out.some((p) => p.includes('4: el original no trae guía'))).toBe(true);
  });

  it('nunca deja pasar un texto que nombre al proveedor de la sonda', () => {
    expect(validateSondaTranslations(file([{ checkId: '1', remediationEs: 'Use Wazuh para corregirlo.' }]), source).some((p) => p.includes('nombra al proveedor'))).toBe(true);
  });

  it('una política que no existe en el catálogo se rechaza entera', () => {
    expect(validateSondaTranslations({ policyId: 'otra', translations: [] }, source)).toEqual(['otra: la política no existe en el catálogo']);
  });
});
