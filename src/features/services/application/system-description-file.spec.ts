import { DomainError } from '../../../common/errors/domain-error';
import {
  assertSystemDescriptionFile,
  SYSTEM_DESCRIPTION_MAX_BYTES,
  sanitizeFileName,
  systemDescriptionKey,
} from './system-description-file';

const pdf = Buffer.from('%PDF-1.7 contenido');
const docx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]);

const codeOf = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (e) {
    return (e as DomainError).code;
  }
};

describe('Descripción del Sistema como archivo (D51)', () => {
  it('acepta un PDF y un .docx reales', () => {
    expect(assertSystemDescriptionFile({ buffer: pdf, originalName: 'sistema.pdf', mimeType: 'application/pdf' })).toBe(
      'application/pdf',
    );
    expect(assertSystemDescriptionFile({ buffer: docx, originalName: 'Sistema.DOCX', mimeType: 'x' })).toContain('wordprocessingml');
  });

  it('rechaza lo que declara un tipo pero no lo es (firma o extensión que no cuadran)', () => {
    expect(codeOf(() => assertSystemDescriptionFile({ buffer: Buffer.from('hola'), originalName: 'a.pdf', mimeType: 'application/pdf' }))).toBe(
      'UNSUPPORTED_MEDIA_TYPE',
    );
    expect(codeOf(() => assertSystemDescriptionFile({ buffer: pdf, originalName: 'a.exe', mimeType: 'application/pdf' }))).toBe(
      'UNSUPPORTED_MEDIA_TYPE',
    );
  });

  it('rechaza el archivo vacío y el que pasa de 25 MB', () => {
    expect(codeOf(() => assertSystemDescriptionFile({ buffer: Buffer.alloc(0), originalName: 'a.pdf', mimeType: '' }))).toBe('FILE_REQUIRED');
    const big = Buffer.alloc(SYSTEM_DESCRIPTION_MAX_BYTES + 1);
    expect(codeOf(() => assertSystemDescriptionFile({ buffer: big, originalName: 'a.pdf', mimeType: '' }))).toBe('FILE_TOO_LARGE');
  });

  it('el nombre no puede salirse de la ruta ni traer caracteres raros', () => {
    expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFileName('C:\\temp\\Descripción del sistema (v2).pdf')).toBe('Descripcion_del_sistema_v2_.pdf');
    expect(sanitizeFileName('...')).toBe('documento');
  });

  it('la llave lleva empresa, servicio y un uuid distinto cada vez', () => {
    const a = systemDescriptionKey('c1', 's1', 'doc.pdf');
    const b = systemDescriptionKey('c1', 's1', 'doc.pdf');
    expect(a).toMatch(/^c1\/services\/s1\/system-description\/[0-9a-f-]{36}\/doc\.pdf$/);
    expect(a).not.toBe(b);
  });
});
