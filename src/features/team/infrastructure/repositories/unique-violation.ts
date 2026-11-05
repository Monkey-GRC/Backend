// Una violación única (P2002) solo es lo que se cree si se mira QUÉ restricción saltó: el correo repetido, el nombre de un grupo repetido y un segundo equipo del mismo
// responsable son errores distintos. Con el adaptador de pg, Prisma no informa `meta.target`: el nombre de la restricción solo viaja en el mensaje original de Postgres.
type PrismaKnownError = {
  code?: string;
  meta?: { target?: unknown; driverAdapterError?: { cause?: { originalMessage?: string; constraint?: unknown; fields?: unknown } } };
};

/** `constraint` es el nombre del índice o restricción en Postgres; `columns`, la forma en que Prisma nombra el `target` cuando sí lo informa (una sola columna). */
export const isUniqueViolationOn = (e: unknown, constraint: string, columns: readonly string[] = []): boolean => {
  const err = e as PrismaKnownError | null;
  if (err?.code !== 'P2002') return false;
  const cause = err.meta?.driverAdapterError?.cause;
  if (cause?.originalMessage?.includes(`"${constraint}"`)) return true;
  const names = [err.meta?.target, cause?.constraint, cause?.fields].flat().filter((x): x is string => typeof x === 'string');
  if (names.includes(constraint)) return true;
  const target = [err.meta?.target, cause?.fields].flat().filter((x): x is string => typeof x === 'string');
  return columns.length > 0 && target.length === columns.length && columns.every((c) => target.includes(c));
};

export const EMAIL_CONSTRAINT = 'users_email_key';
export const GROUP_NAME_CONSTRAINT = 'user_groups_company_id_name_key';
export const ONE_TEAM_PER_LEADER_INDEX = 'user_groups_one_team_per_leader';

export const isEmailTaken = (e: unknown): boolean => isUniqueViolationOn(e, EMAIL_CONSTRAINT, ['email']);
export const isGroupNameTaken = (e: unknown): boolean => isUniqueViolationOn(e, GROUP_NAME_CONSTRAINT, ['company_id', 'name']);
export const isTeamAlreadyExists = (e: unknown): boolean => isUniqueViolationOn(e, ONE_TEAM_PER_LEADER_INDEX, ['leader_id']);
