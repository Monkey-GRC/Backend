import type { EvaluationParameters } from '../evaluation-parameters/parameters';
import type { NotificationEmitter } from '../notifications/notification-emitter';

// MD-502 · Lo que otras features necesitan del motor de cumplimiento (compliance) sin conocer su interior: el puerto lo implementa compliance (infraestructura) y se enlaza en su módulo.
// El cliente de transacción (`tx`) es el de Prisma de `withScope`; aquí es opaco, como en `NotificationEmitter`.
export type ComplianceTransaction = object;

/** La foto de los controles de un servicio antes de escribir algo que puede moverlos (D91). Opaca: solo se la devuelve a `recordControlStateChanges`. */
export type ControlStatesPhoto = Readonly<Record<never, never>>;

export type GapCheck = { id: string; role: 'direct' | 'complementary'; titleEs: string | null; titleEn: string };
export type GapAsset = { id: string; name: string; direct: 'fail' | 'fail_with_exception' | null };
export type GapPerson = { id: string; name: string | null; lastName: string | null };

/** D138 punto 3 · Lo que el motor v2 decide de una prueba de un control para armar sus brechas: los checks con su rol, los activos en alcance con su lectura Directa y el plan vigente. */
export type GapScope = {
  control: { id: string; code: string; name: string };
  test: { id: string; code: string; displayName: string | null; displayNameEn: string | null };
  /** Los checks ratificados vinculados a la prueba (Directo o Complementario). */
  checks: GapCheck[];
  /** Los activos sobre los que se mide la prueba (D160). `fail`: brecha abierta; `fail_with_exception`: exceptuada; `null`: ninguna. */
  assets: GapAsset[];
  /** El plan de remediación aprobado y vigente de la prueba; `null` sin plan. */
  plan: { assignee: GapPerson; dueDate: Date } | null;
  /** El responsable (dueño) activo del control. */
  owner: GapPerson | null;
  /** El instante con el que el motor leyó el servicio. */
  now: Date;
};

export abstract class ComplianceReadings {
  /** La lectura del motor v2 de una prueba de un control; `null` si el control o la prueba no están en la lectura. */
  abstract loadGapScope(tx: ComplianceTransaction, input: { serviceId: string; controlId: string; testId: string; parameters: EvaluationParameters }): Promise<GapScope | null>;

  /** D91 · La foto de los controles del servicio ANTES de que una recolección escriba sus resultados. */
  abstract captureControlStates(tx: ComplianceTransaction, serviceId: string, parameters: EvaluationParameters): Promise<ControlStatesPhoto>;

  /** D91 · Escribe el evento de cada control cuyo estado cambió respecto de `before`, con el sistema como actor (la sonda o el motor de nube al guardar un resultado). */
  abstract recordProbeStateChanges(tx: ComplianceTransaction, input: { tenantId: string; serviceId: string; parameters: EvaluationParameters; before: ControlStatesPhoto; notifications: NotificationEmitter }): Promise<void>;
}
