import { DomainError } from '../../../../common/errors/domain-error';
import { assertEvidenceFile, EVIDENCE_MAX_BYTES, evidenceKey, fileNameOfKey, zipEntryNames } from './evidence-file';

// Zip mínimo (entradas sin comprimir): lo justo para que tenga directorio central, que es lo que se lee.
function zip(names: string[]): Buffer {
  const parts: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const name of names) {
    const n = Buffer.from(name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(n.length, 26);
    const entry = Buffer.concat([local, n]);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0);
    c.writeUInt16LE(n.length, 28);
    c.writeUInt32LE(offset, 42);
    central.push(Buffer.concat([c, n]));
    parts.push(entry);
    offset += entry.length;
  }
  const dir = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(names.length, 8);
  end.writeUInt16LE(names.length, 10);
  end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, dir, end]);
}

const pdf = Buffer.from('%PDF-1.7\n%…contenido…');
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(32)]);
const docx = zip(['[Content_Types].xml', '_rels/.rels', 'word/document.xml']);
const xlsx = zip(['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml']);
const file = (originalName: string, buffer: Buffer) => ({ buffer, originalName, mimeType: 'application/octet-stream' });
const code = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (e) {
    return (e as DomainError).code;
  }
  return undefined;
};

describe('assertEvidenceFile (SEG-60)', () => {
  it.each([
    ['politica.pdf', pdf, 'application/pdf'],
    ['acta.docx', docx, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['matriz.xlsx', xlsx, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['captura.png', png, 'image/png'],
    ['foto.jpg', jpg, 'image/jpeg'],
    ['foto.jpeg', jpg, 'image/jpeg'],
    ['MAYUSCULAS.PDF', pdf, 'application/pdf'],
  ])('acepta %s y devuelve su tipo canónico', (name, buffer, type) => {
    expect(assertEvidenceFile(file(name, buffer))).toBe(type);
  });

  it('rechaza un archivo vacío con FILE_REQUIRED', () => {
    expect(code(() => assertEvidenceFile(file('vacio.pdf', Buffer.alloc(0))))).toBe('FILE_REQUIRED');
  });

  it('acepta exactamente 25 MB y rechaza 25 MB + 1 byte con FILE_TOO_LARGE', () => {
    const exact = Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(EVIDENCE_MAX_BYTES - 5)]);
    expect(exact.length).toBe(EVIDENCE_MAX_BYTES);
    expect(assertEvidenceFile(file('grande.pdf', exact))).toBe('application/pdf');
    expect(code(() => assertEvidenceFile(file('grande.pdf', Buffer.concat([exact, Buffer.alloc(1)]))))).toBe('FILE_TOO_LARGE');
  });

  it.each([
    ['un ejecutable que se hace pasar por PDF', 'factura.pdf', Buffer.from('MZ\x90\x00 programa')],
    ['un PDF con nombre .docx', 'politica.docx', pdf],
    ['un PNG con nombre .jpg', 'captura.jpg', png],
    ['un JPG con nombre .png', 'foto.png', jpg],
    ['un DOCX con nombre .xlsx', 'matriz.xlsx', docx],
    ['un XLSX con nombre .docx', 'acta.docx', xlsx],
    ['un zip cualquiera con nombre .docx', 'cosas.docx', zip(['a.txt', 'b.txt'])],
    ['un zip cualquiera con nombre .xlsx', 'cosas.xlsx', zip(['a.txt'])],
    ['un zip sin [Content_Types].xml', 'falso.docx', zip(['word/document.xml'])],
    ['un zip truncado', 'roto.docx', docx.subarray(0, docx.length - 10)],
    ['un tipo que no se permite (.exe)', 'programa.exe', pdf],
    ['un .txt', 'notas.txt', Buffer.from('hola')],
    ['un archivo sin extensión', 'sin-extension', pdf],
  ])('rechaza %s con UNSUPPORTED_MEDIA_TYPE', (_label, name, buffer) => {
    expect(code(() => assertEvidenceFile(file(name, buffer)))).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('no confía en el tipo que declara el navegador', () => {
    expect(code(() => assertEvidenceFile({ buffer: Buffer.from('MZ'), originalName: 'a.pdf', mimeType: 'application/pdf' }))).toBe('UNSUPPORTED_MEDIA_TYPE');
  });
});

describe('zipEntryNames', () => {
  it('lee los nombres del directorio central sin descomprimir', () => {
    expect(zipEntryNames(docx)).toEqual(['[Content_Types].xml', '_rels/.rels', 'word/document.xml']);
  });
  it('devuelve null si no es un zip o está mal formado', () => {
    expect(zipEntryNames(Buffer.from('no soy un zip'))).toBeNull();
    expect(zipEntryNames(docx.subarray(0, 40))).toBeNull();
  });
});

describe('evidenceKey', () => {
  it('arma <empresa>/services/<servicio>/evidence/<requerimiento>/<uuid>/<nombre> con el nombre limpio', () => {
    const key = evidenceKey('co', 'sv', 'rq', '../../etc/Política de accesos (v2).pdf');
    expect(key).toMatch(/^co\/services\/sv\/evidence\/rq\/[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/);
    expect(key).not.toContain('..');
    expect(fileNameOfKey(key)).toBe('Politica_de_accesos_v2_.pdf');
  });
  it('dos subidas con el mismo nombre no se pisan', () => {
    expect(evidenceKey('co', 'sv', 'rq', 'a.pdf')).not.toBe(evidenceKey('co', 'sv', 'rq', 'a.pdf'));
  });
});
