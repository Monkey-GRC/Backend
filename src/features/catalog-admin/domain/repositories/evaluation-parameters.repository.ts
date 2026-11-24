import { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { ParameterUnit, ParameterValue } from '../../../../common/evaluation-parameters/parameter-definitions';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';

// Los parámetros del motor de evaluación vistos desde Monkey Admin (RC-19, contracts/catalogo-maestro.md). Un solo valor de Monkey para todos los clientes.
export type ParameterRecord = {
  key: string;
  code: string | null;
  unit: ParameterUnit;
  value: ParameterValue;
  defaultValue: ParameterValue;
  updatedAt: Date | null;
  updatedBy: { id: string; name: string } | null;
};

/** Lo que la auditoría guarda: la clave y el valor antes y después (`{ key, value }`). */
export type ParameterChange = { before: ParameterRecord; after: ParameterRecord };

export type ParameterDecision = (current: ParameterRecord, all: readonly ParameterRecord[]) => ParameterValue;

export abstract class EvaluationParametersAdminRepository {
  abstract list(scope: TenantScope): Promise<ParameterRecord[]>;

  // Con la tabla bloqueada contra otro PATCH: `decide` ve el parámetro y todos los demás tal como están y devuelve el valor que queda (o lanza el error de negocio / 422).
  // Si el valor es el vigente no escribe nada ni deja rastro. Escribe el valor y el rastro (`audit`) en la MISMA transacción (SEG-36). `null` si la clave no existe.
  abstract change(scope: TenantScope, key: string, userId: string, decide: ParameterDecision, audit: AuditIntent<ParameterChange>): Promise<ParameterRecord | null>;
}
