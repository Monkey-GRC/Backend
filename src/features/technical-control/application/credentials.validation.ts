import {
  CREDENTIAL_MAX_LENGTH,
  CREDENTIAL_SPECS,
  ConnectionCategory,
} from '../../../common/catalogs/technical-catalogs';
import { FieldError } from '../../../common/errors/validation.exception';

export type NormalizedCredentials = {
  errors: FieldError[];
  // Lo que se cifra y se guarda. Null cuando la conexión es por agente: los agentes no guardan
  // credenciales (modelo-datos.md §6.3).
  toStore: Record<string, unknown> | null;
};

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

// Cada conexión pide credenciales distintas (D46). Se validan aquí, con el mismo formato de error
// por campo que el resto (`credentials.ssh_user: required`), y se devuelve solo lo que se guarda.
export function normalizeCredentials(category: ConnectionCategory, raw: unknown): NormalizedCredentials {
  const spec = CREDENTIAL_SPECS[category];
  const input = (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
  const errors: FieldError[] = [];

  const method = spec.methods ? (input['connection_method'] ?? 'agent') : null;
  if (spec.methods && !spec.methods.includes(method as 'agent' | 'ssh')) {
    errors.push({ field: 'credentials.connection_method', code: 'enum.invalid' });
  }

  const allowed = new Set<string>([...spec.required, ...spec.optional]);
  if (spec.methods) allowed.add('connection_method');
  if (method === 'ssh') spec.sshRequired.forEach((k) => allowed.add(k));
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) errors.push({ field: `credentials.${key}`, code: 'field.not_allowed' });
  }

  const required = method === 'ssh' ? spec.sshRequired : spec.required;
  for (const key of required) {
    if (!isText(input[key])) errors.push({ field: `credentials.${key}`, code: 'required' });
  }
  for (const key of allowed) {
    const value = input[key];
    if (value === undefined || value === null || errors.some((e) => e.field === `credentials.${key}`)) continue;
    if (typeof value !== 'string') errors.push({ field: `credentials.${key}`, code: 'string.invalid' });
    else if (value.length > CREDENTIAL_MAX_LENGTH) errors.push({ field: `credentials.${key}`, code: 'string.max' });
  }
  if (errors.length > 0) return { errors, toStore: null };

  const toStore: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key === 'connection_method') continue;
    if (isText(input[key])) toStore[key] = (input[key] as string).trim();
  }
  if (method === 'ssh') toStore['connection_method'] = 'ssh';
  return { errors, toStore: Object.keys(toStore).length > 0 ? toStore : null };
}
