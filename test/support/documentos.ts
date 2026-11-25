import { createHash } from 'node:crypto';
import { Agent, owner, RUN } from './app';

// MD-503 · Ayudas de las pruebas de Documentos: archivos con contenido real (la firma importa, SEG-60) y el recorrido «publicar una versión» tal como lo manda la pantalla (multipart, `approvers` como texto JSON).

export const pdf = (marca = 'a'): Buffer => Buffer.from(`%PDF-1.7\n% documento ${marca} ${RUN}\n`);
export const png = (marca = 'a'): Buffer => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from(`png ${marca} ${RUN}`)]);

/** Un zip mínimo (entradas sin comprimir): lo justo para que tenga directorio central, que es lo que se lee para reconocer un .docx o un .xlsx. */
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
export const docx = (): Buffer => zip(['[Content_Types].xml', '_rels/.rels', 'word/document.xml']);
export const xlsx = (): Buffer => zip(['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml']);
export const sha256 = (b: Buffer): string => createHash('sha256').update(b).digest('hex');

export const APROBADORES = [{ name: 'María Pérez', role_label: 'Gerente general' }];
export const hoy = (dias = 0): string => new Date(Date.now() + dias * 86_400_000).toISOString().slice(0, 10);

export type Publicacion = { file?: Buffer | null; name?: string; approved_at?: string; approvers?: unknown; note?: string; extra?: Record<string, string> };

/** `POST /v1/documents/{id}/versions` como lo manda la pantalla: multipart con `approvers` en JSON. */
export function publicar(agent: Agent, documentId: string, o: Publicacion = {}) {
  let req = agent.post(`/v1/documents/${documentId}/versions`);
  const file = o.file === undefined ? pdf() : o.file;
  if (file) req = req.attach('file', file, o.name ?? 'politica.pdf');
  req = req.field('approved_at', o.approved_at ?? hoy(-3)).field('approvers', typeof o.approvers === 'string' ? o.approvers : JSON.stringify(o.approvers ?? APROBADORES));
  if (o.note !== undefined) req = req.field('note', o.note);
  for (const [k, v] of Object.entries(o.extra ?? {})) req = req.field(k, v);
  return req;
}

/** Los documentos de una empresa por código. `aceptacion` filtra por `acceptance`. */
export async function documentosDe(companyId: string, aceptacion?: 'users_who_apply' | 'all_users' | 'not_required'): Promise<Array<{ id: string; code: string; acceptance: string }>> {
  return owner<{ id: string; code: string; acceptance: string }>(
    `select cd.id, d.code, cd.acceptance::text from tenant.company_documents cd join catalog.documents d on d.id = cd.document_id
      where cd.tenant_id = $1 and ($2::text is null or cd.acceptance::text = $2) order by d.code`,
    [companyId, aceptacion ?? null],
  );
}

export const auditoria = (companyId: string, action: string) =>
  owner<{ user_id: string | null; result: string; before_state: any; after_state: any }>(
    'select user_id, result::text, before_state, after_state from audit.audit_logs where tenant_id = $1 and action = $2 order by created_at',
    [companyId, action],
  );
