import { USER_ROLES, type UserRole } from '../enums/user-role.enum';

// D136, D150 · La matriz de permisos de la Tabla 2 (`modelo-datos.md` §5.5) en UN solo lugar. Cada fila es un permiso; cada celda, lo que un rol puede con él. Lo aplica el
// `PermissionsGuard`, que NIEGA POR DEFECTO: una ruta sin permiso declarado (`@Can`), sin `@Public` y sin `@AnyAuthenticated` responde 403 (SEG-86).
//
// Las celdas siguen el libro del comité:
//   all      ✓  puede, sin acotar.
//   scoped   ⊗  puede con restricción: lo suyo (los controles de los que es dueño o ejecutor, los documentos que le asignaron, su equipo). El caso de uso la aplica con `scopeOf`.
//   pending  ✓ en el libro, aún sin construir: se NIEGA hasta que se construya. Cada una tiene su deuda (`DT-123`, `DT-124`) o su ticket (MD-504, MD-506).
//   null     vacío: prohibido.
export type Cell = 'all' | 'scoped' | 'pending' | null;
/** `none` es lo que ven el guard y los casos de uso tanto en una celda vacía como en una `pending`. */
export type Scope = 'all' | 'scoped' | 'none';

const A = 'all';
const S = 'scoped';
const P = 'pending';
const N = null;

type Row = readonly [monkey: Cell, admin: Cell, responsable: Cell, delegado: Cell, auditor: Cell, colaborador: Cell];

// Orden de las columnas = `USER_ROLES` (lo comprueba permission-matrix.spec.ts):
//                                         admin_monkey · admin_empresa · responsable · delegado · auditor · colaborador
export const PERMISSIONS = {
  // ── Empresas ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  'companies.manage': [A, N, N, N, N, N], // Crear, suspender o eliminar empresa (y fijar su cupo, D103)
  'company.configure': [P, A, N, N, N, N], // Ver y editar la configuración de la empresa (contexto organizacional, DT-124)
  // ── Usuarios ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  'users.manage': [P, A, N, N, N, N], // Crear, editar, desactivar y reactivar usuarios; asignar roles
  'assignments.owner': [P, A, N, N, N, N], // Asignar controles a usuarios (el dueño de un control)
  'groups.manage': [N, A, N, N, N, N], // Crear grupos y mover a alguien de equipo (D102; la matriz manda sobre D104)
  'team.workload': [N, A, N, N, N, N], // Ver la carga de trabajo de cada persona (D122)
  // ── Controles ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  'controls.manage': [N, A, N, N, N, N], // Crear y dar de baja un control
  'controls.edit': [N, A, S, N, N, N], // Editar un control (interpretación y dimensiones; el responsable, los suyos)
  'controls.view': [P, A, S, S, A, N], // Ver un control
  'controls.delegate': [N, A, S, N, N, N], // Delegar un control en un usuario de su equipo (D150: el administrador también)
  'controls.approve_first': [N, A, S, N, N, N], // Primera aprobación del cumplimiento del control (MD-504)
  'controls.approve_final': [N, A, N, N, N, N], // Aprobación final del cumplimiento del control (MD-504)
  // ── Riesgos ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  'risks.create': [N, A, N, N, N, N], // Crear riesgo
  'risks.edit': [N, A, S, N, N, N], // Editar riesgo (el responsable, los ligados a sus controles por sus causas, D150)
  'risks.view': [P, A, S, S, A, N], // Ver riesgo
  // ── Evidencia ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  'evidence.upload': [N, A, S, S, N, N], // Subir evidencia
  'evidence.view': [P, A, S, S, A, N], // Ver evidencia
  'evidence.retire': [N, A, N, N, N, N], // Dar de baja una evidencia («eliminar»: nunca se borra)
  'exclusions.decide': [N, A, N, N, N, N], // Decidir la excepción de un check (D135)
  // ── Documentos (corte mínimo, D152; el resto: MD-506) ────────────────────────────────────────────────────────────────────────────────
  'documents.assign_owner': [P, A, N, N, N, N], // Asignar el responsable de un documento
  'documents.write': [N, A, P, N, N, N], // Crear, importar o editar un documento y sus versiones (el responsable, los suyos: MD-506)
  'documents.workflow': [N, A, P, N, N, N], // Definir el flujo de aprobación; enviar o cancelar la solicitud (MD-506)
  'documents.approve': [N, A, P, N, N, N], // Aprobar o rechazar un documento (MD-506)
  'documents.assign': [N, A, P, N, N, N], // Definir quiénes deben aceptarlo
  'documents.accept': [N, A, A, A, N, A], // Aceptar un documento asignado
  'documents.view_current': [P, A, S, S, A, S], // Ver el documento vigente (el archivo; los demás, los que le asignaron)
  'documents.history': [P, A, P, N, A, N], // Ver el historial de versiones, aprobaciones y aceptaciones (el responsable: MD-506)
  'documents.archive': [N, A, N, N, N, N], // Archivar un documento
  // ── Pruebas ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  'tests.execute': [N, A, P, P, P, N], // Ejecutar o relanzar una prueba (DT-123)
  'tests.results': [P, A, S, S, A, N], // Ver resultados de pruebas
  // ── Auditoría ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  'audit.observe': [N, N, N, N, A, N], // Módulo de auditoría y registrar observaciones (§7.6)
  'observations.answer': [N, A, S, S, N, N], // Responder una observación (D102)
  'audit.log': [P, A, S, N, A, N], // Ver el registro de auditoría
  // ── Reportes ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  'reports.export': [P, A, N, N, A, N], // Exportar reportes de cumplimiento y el borrador SOC
  'reports.dashboard': [P, A, S, N, A, N], // Generar el tablero de cumplimiento (D150: el delegado no lo ve)
  'reports.technical_view': [N, A, N, N, A, N], // Vista técnica (D81)
  // ── Integraciones y seguridad ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  'integrations.configure': [P, A, N, N, N, N], // Crear o rotar API keys y configurar conectores
  'integrations.view': [N, A, N, N, A, N], // Ver las integraciones de la empresa (D110; el auditor, solo lectura)
  'security.policies': [P, A, N, N, N, N], // Configurar políticas de seguridad
  'users.reset_mfa': [P, A, S, N, N, N], // Gestionar la MFA de un usuario (el responsable, los delegados de su equipo; `admin_monkey`: por consola)
  // ── Cuenta ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  'account.manage': [A, A, A, A, A, A], // Editar su perfil y configurar su propia MFA

  // ── Lo que el libro no define como fila y está construido (la fuente está en el comentario; DEV-16) ───────────────────────────────────────
  'monkey_admins.manage': [A, N, N, N, N, N], // D117 · Cuentas de `admin_monkey`
  'catalog.manage': [A, N, N, N, N, N], // El catálogo maestro y los parámetros de evaluación
  'account.devices': [N, A, A, A, A, A], // D94 · Dispositivos de confianza (`admin_monkey` no recuerda dispositivo)
  'services.manage': [N, A, N, N, N, N], // Servicios y contexto de servicio (D40, D45)
  'services.view': [N, A, S, S, A, N], // Los servicios con algún control suyo
  'users.list': [N, A, S, N, N, N], // La lista del equipo (el responsable, el suyo)
  'groups.list': [N, A, S, N, N, N], // Listar grupos (el responsable, el suyo)
  'controls.periodicity': [N, A, N, N, N, N], // D147 · Cambiar la periodicidad de un control
  'assignments.view': [P, A, S, S, A, N], // Ver la asignación de dueño y ejecutor
  'risks.manage': [N, A, N, N, N, N], // Dar de baja, reactivar y vincular riesgos y causas; evaluar y tratar un riesgo
  'risks.history': [N, A, N, N, A, N], // El historial de evaluaciones de un riesgo
  'evidence.review': [N, A, S, N, N, N], // D121 · Revisar una entrega de evidencia (dos niveles)
  'evidence.requirements': [N, A, N, N, N, N], // Agregar un requisito de evidencia a un control
  'exclusions.view': [N, A, N, N, A, N], // Ver las exclusiones de un servicio
  'verdicts.register': [N, A, S, S, N, N], // MD-155 · Registrar el veredicto de una prueba manual
  'verdicts.review': [N, A, S, N, N, N], // D121 · Revisar un veredicto
  'observations.view': [N, A, S, S, A, N], // Ver las observaciones del auditor
  'periods.manage': [N, A, N, N, N, N], // D87 · Fijar el período auditado de un servicio y marco
  'periods.view': [N, A, N, N, A, N], // Ver los períodos auditados
  'responsibles.view': [N, A, A, N, A, N], // Los cargos responsables de la organización
  'responsibles.manage': [N, A, N, N, N, N], // Crear, editar y quitar cargos responsables
  'work.mine': [N, N, S, S, N, N], // D122 · «Mi trabajo»
  'documents.mine': [N, S, S, S, N, S], // D152 · «Mis documentos»: lo que le asignaron a quien pregunta
} as const satisfies Record<string, Row>;

export type Permission = keyof typeof PERMISSIONS;

/** Las claves, para recorrer la matriz (pruebas y documentación). */
export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[];

const columnOf = (role: string): number => (USER_ROLES as readonly string[]).indexOf(role);

/** La celda tal como está en la matriz; `null` si el rol no existe o la celda está vacía. */
export function cellOf(permission: Permission, role: string): Cell {
  const column = columnOf(role);
  return column < 0 ? null : (PERMISSIONS[permission] as Row)[column];
}

/** Hasta dónde llega un rol con un permiso: `all`, `scoped` (lo suyo) o `none` (vacío o aún pendiente). Un rol desconocido no tiene nada. */
export function scopeOf(permission: Permission, role: string): Scope {
  const cell = cellOf(permission, role);
  return cell === 'all' || cell === 'scoped' ? cell : 'none';
}

/** El rol puede usar el permiso (sin acotar o acotado). */
export const can = (permission: Permission, role: string): boolean => scopeOf(permission, role) !== 'none';

/** El caso de uso debe limitarse a lo suyo. Sustituye a la lista fija «responsable o delegado»: cada permiso dice quién va acotado. */
export const isScoped = (permission: Permission, role: string): boolean => scopeOf(permission, role) === 'scoped';

/** Los roles que pasan el guard con el permiso, en el orden de la tabla (para la documentación de la API). */
export const rolesWith = (permission: Permission): UserRole[] => USER_ROLES.filter((role) => can(permission, role));
