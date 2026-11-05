// Solo la restricción única del correo es EMAIL_TAKEN: cualquier otra violación única (p. ej. el nombre de un grupo) no es un correo repetido y se relanza.
// Con el adaptador de pg, Prisma no informa `meta.target`: el nombre de la restricción solo viaja en el mensaje original de Postgres.
type PrismaKnownError = {
  code?: string;
  meta?: { target?: unknown; driverAdapterError?: { cause?: { originalMessage?: string; constraint?: unknown; fields?: unknown } } };
};

const EMAIL_CONSTRAINT = 'users_email_key';

export const isEmailTaken = (e: unknown): boolean => {
  const err = e as PrismaKnownError | null;
  if (err?.code !== 'P2002') return false;
  const cause = err.meta?.driverAdapterError?.cause;
  if (cause?.originalMessage?.includes(`"${EMAIL_CONSTRAINT}"`)) return true;
  const names = [err.meta?.target, cause?.constraint, cause?.fields].flat().filter((x): x is string => typeof x === 'string');
  return names.some((n) => n === EMAIL_CONSTRAINT || n === 'email');
};
