import { randomBytes } from 'node:crypto';
import {
  AWS_ACCOUNT_ID,
  CLOUD_PLATFORM_AWS,
  ConnectionMethodValue,
  MAX_REGIONS,
} from '../../../common/catalogs/technical-catalogs';
import { DomainError } from '../../../common/errors/domain-error';
import { FieldError } from '../../../common/errors/validation.exception';
import { PlatformRule } from '../domain/entities/technical-control.entities';

// Reglas del alta de un activo con su canal de conexión (D53, D58; contracts/modules/onboarding-technical-control.md). Funciones puras: sin Nest ni base de datos.

export type ConnectionRequest = {
  connectionMethod: ConnectionMethodValue;
  externalAccountId?: string | null;
  regions?: string[];
  credentials?: Record<string, unknown>;
};

export type ConnectionPlan = {
  method: ConnectionMethodValue;
  platformId: string;
  platform: string;
  externalAccountId: string | null;
  regions: string[];
  // Lo que se cifra y se guarda (solo el canal de llaves). Nunca se devuelve.
  secretToStore: { access_key_id: string; secret_access_key: string } | null;
  // Lo genera Monkey; no es un secreto del cliente. Evita que otro cliente use el rol de este (confused deputy).
  externalId: string | null;
};

const text = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
// Un identificador de llave de acceso: letras mayúsculas y números. No se valida más: AWS es quien dice si sirve.
const ACCESS_KEY_ID = /^[A-Z0-9]{16,128}$/;

export function newExternalId(): string {
  return `mk-${randomBytes(10).toString('hex')}`;
}

// La cuenta y las regiones declaradas de una conexión de nube. Lo usan el alta y la edición. Las regiones válidas son las de la plataforma (catálogo, D67).
export function checkCloudTarget(
  externalAccountId: string | null | undefined,
  regionsInput: string[] | undefined,
  allowedRegions: readonly string[],
): { errors: FieldError[]; account: string | null; regions: string[] } {
  const errors: FieldError[] = [];
  const account = text(externalAccountId);
  if (!account) errors.push({ field: 'external_account_id', code: 'required' });
  else if (!AWS_ACCOUNT_ID.test(account)) errors.push({ field: 'external_account_id', code: 'invalid' });

  const regions = regionsInput ?? [];
  if (regions.length === 0) errors.push({ field: 'regions', code: 'array.min' });
  else if (regions.length > MAX_REGIONS) errors.push({ field: 'regions', code: 'array.max' });
  else if (new Set(regions).size !== regions.length) errors.push({ field: 'regions', code: 'array.unique' });
  else if (!regions.every((r) => allowedRegions.includes(r))) errors.push({ field: 'regions', code: 'invalid' });
  return { errors, account, regions };
}

// `platform` es la plataforma elegida, ya comprobada contra el catálogo: existe en la conexión y está disponible. Aquí se valida lo que sigue: el canal y los datos de la conexión.
export function planConnection(req: ConnectionRequest, platform: PlatformRule): { errors: FieldError[]; plan: ConnectionPlan | null } {
  // Un canal que la plataforma no tiene no es un error de formulario: es una combinación imposible (409).
  if (!platform.connectionMethods.includes(req.connectionMethod)) throw new DomainError('CONNECTION_METHOD_NOT_APPLICABLE');

  if (req.connectionMethod === 'agent') {
    const errors: FieldError[] = [];
    if (req.credentials !== undefined) errors.push({ field: 'credentials', code: 'field.not_allowed' });
    return {
      errors,
      plan: errors.length ? null : { method: 'agent', platformId: platform.id, platform: platform.code, externalAccountId: null, regions: [], secretToStore: null, externalId: null },
    };
  }

  // Nube: hoy solo el flujo de AWS (D58). Una plataforma con canal de nube que aún no tiene su flujo no llega aquí: se queda bloqueada en el catálogo.
  const errors: FieldError[] = [];
  if (platform.code !== CLOUD_PLATFORM_AWS) throw new DomainError('CONNECTION_METHOD_NOT_APPLICABLE');
  // Cuenta y regiones declaradas, y solo se evalúan esas regiones (D53).
  const target = checkCloudTarget(req.externalAccountId, req.regions, platform.regionCodes);
  errors.push(...target.errors);
  const { account, regions } = target;

  let secretToStore: ConnectionPlan['secretToStore'] = null;
  if (req.connectionMethod === 'readonly_role') {
    if (req.credentials !== undefined) errors.push({ field: 'credentials', code: 'field.not_allowed' });
  } else {
    const creds = (req.credentials ?? {}) as Record<string, unknown>;
    const id = text(creds['access_key_id']);
    const secret = text(creds['secret_access_key']);
    for (const key of Object.keys(creds)) if (key !== 'access_key_id' && key !== 'secret_access_key') errors.push({ field: `credentials.${key}`, code: 'field.not_allowed' });
    if (!id) errors.push({ field: 'credentials.access_key_id', code: 'required' });
    else if (!ACCESS_KEY_ID.test(id)) errors.push({ field: 'credentials.access_key_id', code: 'invalid' });
    if (!secret) errors.push({ field: 'credentials.secret_access_key', code: 'required' });
    else if (secret.length > 200) errors.push({ field: 'credentials.secret_access_key', code: 'string.max' });
    if (id && secret) secretToStore = { access_key_id: id, secret_access_key: secret };
  }
  if (errors.length > 0) return { errors, plan: null };
  return {
    errors,
    plan: {
      method: req.connectionMethod,
      platformId: platform.id,
      platform: platform.code,
      externalAccountId: account,
      regions,
      secretToStore,
      externalId: req.connectionMethod === 'readonly_role' ? newExternalId() : null,
    },
  };
}

// Lo que el cliente ve para completar la conexión: sin secretos, y sin nombrar al proveedor del motor. `monkeyPrincipalArn` es la identidad de
// Monkey que asume el rol del cliente (configuración, no secreto).
export type ConnectionSetup =
  | {
      method: 'readonly_role';
      externalId: string;
      monkeyPrincipalArn: string | null;
      roleName: string;
      templatePath: string;
      steps: string[];
      roleArn: string | null;
    }
  | { method: 'access_keys'; warning: string; steps: string[] }
  | { method: 'agent'; steps: string[] };

export const ROLE_NAME = 'MonkeyReadOnly';
// Cómo se llama el archivo que el cliente descarga (la plantilla de CloudFormation).
export const TEMPLATE_FILE_NAME = 'RoleMonkeyReadOnly.yaml';
export const ROLE_TEMPLATE_PATH = '/v1/connection-templates/aws-readonly-role';

export function buildConnectionSetup(
  p: { connectionMethod: ConnectionMethodValue | null; externalId: string | null; roleArn: string | null },
  monkeyPrincipalArn: string | null,
): ConnectionSetup | null {
  if (p.connectionMethod === 'readonly_role' && p.externalId) {
    return {
      method: 'readonly_role',
      externalId: p.externalId,
      monkeyPrincipalArn,
      roleName: ROLE_NAME,
      templatePath: ROLE_TEMPLATE_PATH,
      roleArn: p.roleArn,
      steps: ['connection.aws_role.step_1', 'connection.aws_role.step_2', 'connection.aws_role.step_3', 'connection.aws_role.step_4'],
    };
  }
  if (p.connectionMethod === 'access_keys') {
    return { method: 'access_keys', warning: 'connection.access_keys.less_secure', steps: ['connection.access_keys.step_1', 'connection.access_keys.step_2'] };
  }
  if (p.connectionMethod === 'agent') return { method: 'agent', steps: ['connection.agent.step_1', 'connection.agent.step_2'] };
  return null;
}
