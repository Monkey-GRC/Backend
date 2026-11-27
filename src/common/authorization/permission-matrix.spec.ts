import { USER_ROLES } from '../enums/user-role.enum';
import { can, cellOf, isScoped, PERMISSION_KEYS, PERMISSIONS, rolesWith, scopeOf, type Cell, type Permission } from './permission-matrix';

// La Tabla 2 (modelo-datos.md §5.5) fila por fila, escrita aparte del código: si alguien cambia una celda, esta prueba la señala. Columnas, en el orden del libro:
// admin_monkey · admin_empresa · responsable · delegado · auditor · colaborador. ✓ = 'all' · ⊗ = 'scoped' · P = ✓ del libro aún sin construir (se niega) · '' = vacío.
const T = '✓';
const S = '⊗';
const P = 'P';
const BOOK: Array<[Permission, string, [string, string, string, string, string, string]]> = [
  ['companies.manage', 'Empresas · Crear, suspender o eliminar empresa', [T, '', '', '', '', '']],
  ['company.configure', 'Empresas · Ver y editar la configuración', [P, T, '', '', '', '']],
  ['users.manage', 'Usuarios · Crear, editar, desactivar y reactivar; asignar roles', [P, T, '', '', '', '']],
  ['assignments.owner', 'Usuarios · Asignar controles a usuarios (el dueño)', [P, T, '', '', '', '']],
  ['groups.manage', 'Usuarios · Crear grupos y mover a alguien de equipo', ['', T, '', '', '', '']],
  ['team.workload', 'Usuarios · Ver la carga de trabajo', ['', T, '', '', '', '']],
  ['controls.manage', 'Controles · Crear y dar de baja', ['', T, '', '', '', '']],
  ['controls.edit', 'Controles · Editar', ['', T, S, '', '', '']],
  ['controls.view', 'Controles · Ver', [P, T, S, S, T, '']],
  ['controls.delegate', 'Controles · Delegar en un usuario de su equipo', ['', T, S, '', '', '']],
  ['controls.approve_first', 'Controles · Primera aprobación', ['', T, S, '', '', '']],
  ['controls.approve_final', 'Controles · Aprobación final', ['', T, '', '', '', '']],
  ['risks.create', 'Riesgos · Crear', ['', T, '', '', '', '']],
  ['risks.edit', 'Riesgos · Editar', ['', T, S, '', '', '']],
  ['risks.view', 'Riesgos · Ver', [P, T, S, S, T, '']],
  ['evidence.upload', 'Evidencia · Subir', ['', T, S, S, '', '']],
  ['evidence.view', 'Evidencia · Ver', [P, T, S, S, T, '']],
  ['evidence.retire', 'Evidencia · Dar de baja', ['', T, '', '', '', '']],
  ['exclusions.decide', 'Evidencia · Decidir la excepción de un check', ['', T, '', '', '', '']],
  ['documents.assign_owner', 'Documentos · Asignar el responsable de un documento', [P, T, '', '', '', '']],
  ['documents.write', 'Documentos · Crear, importar o editar un documento y sus versiones', ['', T, P, '', '', '']],
  ['documents.workflow', 'Documentos · Definir el flujo de aprobación; enviar o cancelar', ['', T, P, '', '', '']],
  ['documents.approve', 'Documentos · Aprobar o rechazar', ['', T, P, '', '', '']],
  ['documents.assign', 'Documentos · Definir quiénes deben aceptarlo', ['', T, P, '', '', '']],
  ['documents.accept', 'Documentos · Aceptar un documento asignado', ['', T, T, T, '', T]],
  ['documents.view_current', 'Documentos · Ver el documento vigente', [P, T, S, S, T, S]],
  ['documents.history', 'Documentos · Ver el historial de versiones, aprobaciones y aceptaciones', [P, T, P, '', T, '']],
  ['documents.archive', 'Documentos · Archivar un documento', ['', T, '', '', '', '']],
  ['tests.execute', 'Pruebas · Ejecutar o relanzar una prueba', ['', T, P, P, P, '']],
  ['tests.results', 'Pruebas · Ver resultados de pruebas', [P, T, S, S, T, '']],
  ['audit.observe', 'Auditoría · Módulo de auditoría y registrar observaciones', ['', '', '', '', T, '']],
  ['observations.answer', 'Auditoría · Responder una observación', ['', T, S, S, '', '']],
  ['audit.log', 'Auditoría · Ver el registro de auditoría', [P, T, S, '', T, '']],
  ['reports.export', 'Reportes · Exportar reportes de cumplimiento y el borrador SOC', [P, T, '', '', T, '']],
  ['reports.dashboard', 'Reportes · Generar el tablero de cumplimiento', [P, T, S, '', T, '']],
  ['reports.technical_view', 'Reportes · Vista técnica', ['', T, '', '', T, '']],
  ['integrations.configure', 'Integraciones · Crear o rotar API keys y configurar conectores', [P, T, '', '', '', '']],
  ['integrations.view', 'Integraciones · Ver las integraciones de la empresa', ['', T, '', '', T, '']],
  ['security.policies', 'Seguridad · Configurar políticas de seguridad', [P, T, '', '', '', '']],
  ['users.reset_mfa', 'Seguridad · Gestionar la MFA de un usuario', [P, T, S, '', '', '']],
  ['account.manage', 'Cuenta · Editar su perfil y configurar su propia MFA', [T, T, T, T, T, T]],
];

const cellOfSymbol = (symbol: string): Cell => (symbol === T ? 'all' : symbol === S ? 'scoped' : symbol === P ? 'pending' : null);

describe('la matriz de permisos (§5.5, D136, D150)', () => {
  it('las columnas son los seis roles, en el orden del libro', () => {
    expect([...USER_ROLES]).toEqual(['admin_monkey', 'admin_empresa', 'responsable', 'delegado', 'auditor', 'colaborador']);
  });

  it.each(BOOK)('%s · %s', (permission, _row, cells) => {
    USER_ROLES.forEach((role, i) => expect({ role, cell: cellOf(permission, role) }).toEqual({ role, cell: cellOfSymbol(cells[i]) }));
  });

  it('cada permiso del libro está declarado y los que no están son los construidos fuera de la tabla (con su fuente en el código)', () => {
    const book = new Set(BOOK.map(([key]) => key));
    expect(book.size).toBe(BOOK.length);
    for (const [key] of BOOK) expect(PERMISSION_KEYS).toContain(key);
    const extras = PERMISSION_KEYS.filter((k) => !book.has(k)).sort();
    expect(extras).toEqual([
      'account.devices', 'assignments.view', 'catalog.manage', 'controls.decide_level', 'controls.declare_no_occurrences', 'controls.na_decide', 'controls.na_request', 'controls.periodicity', 'controls.plan_decide', 'controls.plan_register', 'controls.propose_level', 'documents.mine', 'evidence.requirements', 'exclusions.view', 'groups.list', 'monkey_admins.manage',
      'observations.view', 'periods.manage', 'periods.view', 'responsibles.manage', 'responsibles.view', 'risks.history', 'risks.manage', 'services.manage', 'services.view', 'users.directory', 'users.list', 'verdicts.register',
      'work.mine',
    ]);
  });

  it('D150 · lo que cambia frente a lo construido', () => {
    // El responsable ya no crea usuarios ni grupos; el administrador delega; el delegado no ve el tablero; el responsable edita lo suyo y restablece la MFA de su equipo.
    expect(can('users.manage', 'responsable')).toBe(false);
    expect(can('groups.manage', 'responsable')).toBe(false);
    expect(scopeOf('controls.delegate', 'admin_empresa')).toBe('all');
    expect(can('reports.dashboard', 'delegado')).toBe(false);
    expect(isScoped('controls.edit', 'responsable')).toBe(true);
    expect(isScoped('risks.edit', 'responsable')).toBe(true);
    expect(isScoped('users.reset_mfa', 'responsable')).toBe(true);
  });

  it('lo pendiente se NIEGA (DT-123, DT-124) y un rol desconocido no tiene nada', () => {
    expect(scopeOf('controls.view', 'admin_monkey')).toBe('none');
    expect(can('tests.execute', 'responsable')).toBe(false);
    expect(can('tests.execute', 'admin_empresa')).toBe(true);
    for (const key of PERMISSION_KEYS) expect(can(key, 'superusuario')).toBe(false);
  });

  it('SEG-85 · el colaborador solo tiene su cuenta y sus documentos', () => {
    const own = PERMISSION_KEYS.filter((key) => can(key, 'colaborador')).sort();
    expect(own).toEqual(['account.devices', 'account.manage', 'documents.accept', 'documents.mine', 'documents.view_current']);
  });

  it('scopeOf y rolesWith salen de la misma celda', () => {
    expect(rolesWith('controls.view')).toEqual(['admin_empresa', 'responsable', 'delegado', 'auditor']);
    for (const key of PERMISSION_KEYS) for (const role of USER_ROLES) expect(can(key, role)).toBe(rolesWith(key).includes(role));
    expect(Object.keys(PERMISSIONS).length).toBe(PERMISSION_KEYS.length);
  });
});
