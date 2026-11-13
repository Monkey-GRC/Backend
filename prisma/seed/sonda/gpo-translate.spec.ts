import { noteEs, translateGpoRemediation, valueGloss } from './gpo-translate';
import { SourcePolicy, validateSondaTranslations } from './translations';

const PATH = 'Computer Configuration\\Policies\\Windows Settings\\Security Settings\\Account Policies\\Password Policy\\Enforce password history';
const original = (value: string) => `To establish the recommended configuration via GP, set the following UI path to ${value}: ${PATH}.`;

describe('translateGpoRemediation (D112)', () => {
  it('traduce el formato estándar: la ruta va exacta en un bloque de código y el valor se explica en español', () => {
    const es = translateGpoRemediation(original('24 or more password(s)'))!;
    expect(es).toContain('fije la siguiente ruta de la interfaz en `24 or more password(s)` (24 o más contraseña(s)):');
    expect(es).toContain('```\n' + PATH + '\n```');
    expect(es).toContain('La ruta está en inglés');
  });

  it('lo que genera pasa la validación contra su original (la ruta aparece igual)', () => {
    const source = new Map<string, SourcePolicy>([['cis_win2022', new Map([['1', { remediation: original('Enabled'), remediationEs: null }]])]]);
    const es = translateGpoRemediation(original('Enabled'))!;
    expect(validateSondaTranslations({ policyId: 'cis_win2022', translations: [{ checkId: '1', remediationEs: es }] }, source)).toEqual([]);
  });

  it('tolera saltos de línea y espacios del PDF, y la variante «implement»', () => {
    const es = translateGpoRemediation(`To implement the recommended configuration via GP, set the following UI path to Enabled:\n   ${PATH}\n.`)!;
    expect(es).toContain('`Enabled` (Habilitada)');
    expect(es).toContain(PATH);
  });

  it('un valor con dos puntos («Enabled: …») no se confunde con el separador de la ruta', () => {
    const es = translateGpoRemediation(original('Enabled: 15,30 or greater'))!;
    expect(es).toContain('`Enabled: 15,30 or greater` (Habilitada: 15,30 or greater)');
    expect(es).toContain('```\n' + PATH + '\n```');
  });

  it('un valor sin regla se muestra tal cual, sin inventar una explicación', () => {
    const es = translateGpoRemediation(original('Prompt for consent on the secure desktop'))!;
    expect(es).toContain('en `Prompt for consent on the secure desktop`:');
    expect(es).not.toContain('(Prompt');
  });

  it('tolera las variantes «to: valor:» y «to Valor. ruta» del formato', () => {
    expect(translateGpoRemediation(`To establish the recommended configuration via GP, set the following UI path to: Disabled: ${PATH}.`)).toContain('en `Disabled` (Deshabilitada):');
    expect(translateGpoRemediation(`To establish the recommended configuration via GP, set the following UI path to Enabled. ${PATH}`)).toContain('en `Enabled` (Habilitada):');
    // Un valor con un punto dentro no se parte donde no debe.
    expect(translateGpoRemediation(`To establish the recommended configuration via GP, set the following UI path to: Send NTLMv2 response only. Refuse LM & NTLM: ${PATH}.`)).toContain('`Send NTLMv2 response only. Refuse LM & NTLM`');
  });

  it('separa la «Note:» de la ruta y la traduce; la ruta queda exacta, sin la nota', () => {
    const es = translateGpoRemediation(`To establish the recommended configuration via GP, set the following UI path to Enabled: ${PATH} Note: This Group Policy path is provided by the Group Policy template WindowsFirewall.admx/adml that is included with all versions of the Microsoft Windows Administrative Templates.`)!;
    expect(es).toContain('```\n' + PATH + '\n```');
    expect(es).toContain('Nota: esta ruta la proporciona la plantilla de directiva de grupo `WindowsFirewall.admx/adml`, incluida en todas las versiones de las Plantillas administrativas de Microsoft Windows.');
  });

  it('traduce las notas de «puede no existir» y de «plantilla adicional»', () => {
    expect(noteEs('This Group Policy path may not exist by default. It is provided by the Group Policy template Foo.admx/adml that is included with the Microsoft Windows 10 Release 1607 & Server 2016 Administrative Templates (or newer).')).toBe(
      'Nota: es posible que esta ruta no exista por omisión; la proporciona la plantilla de directiva de grupo `Foo.admx/adml`, incluida en las Plantillas administrativas de Microsoft Windows 10 Release 1607 & Server 2016 (o posteriores).',
    );
    expect(noteEs('This Group Policy path does not exist by default. An additional Group Policy template (SecGuide.admx/adml) is required - it is available from Microsoft at this link.')).toBe(
      'Nota: esta ruta no existe por omisión; hace falta una plantilla de directiva de grupo adicional (`SecGuide.admx/adml`), disponible para descargar en Microsoft.',
    );
  });

  it('una nota que no sigue una forma conocida queda como una nota general, cierta para todas', () => {
    expect(noteEs('Something completely different. Note #2: older versions.')).toContain('depende de una plantilla administrativa');
  });

  it('la variante «configure» (sin valor, o a un valor propio de la organización)', () => {
    expect(translateGpoRemediation(`To establish the recommended configuration via GP, configure the following UI path: ${PATH}.`)).toContain('configure la siguiente ruta de la interfaz:');
    expect(translateGpoRemediation(`To establish the recommended configuration via GP, configure the following UI path to a value that is consistent with the security and operational requirements of your organization: ${PATH}.`)).toContain('con un valor acorde con los requisitos de seguridad');
  });

  it('lo que no sigue el formato se devuelve como null, para traducirlo a mano', () => {
    expect(translateGpoRemediation('In order to utilize LAPS, a minor Active Directory Schema update is required.')).toBeNull();
  });
});

describe('valueGloss', () => {
  it.each([
    ['Enabled', 'Habilitada'],
    ['Disabled', 'Deshabilitada'],
    ['Success and Failure', 'Correcto y Error'],
    ['1 or more day(s)', '1 o más día(s)'],
    ['365 or fewer days, but not 0', '365 días o menos, pero no 0'],
    ['5 or fewer invalid login attempt(s), but not 0', '5 o menos intento(s) de inicio de sesión no válido(s), pero no 0'],
    ['32,768 KB or greater', '32,768 KB o más'],
  ])('%s → %s', (value, gloss) => expect(valueGloss(value)).toBe(gloss));

  it('devuelve null cuando no conoce el valor', () => {
    expect(valueGloss('Secure Boot or Secure Boot and DMA Protection')).toBeNull();
  });
});
