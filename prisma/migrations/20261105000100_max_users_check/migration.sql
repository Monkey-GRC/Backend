-- D103 · El cupo de usuarios es un entero ≥ 1. Una empresa que aún no tiene cupo fijado queda en NULL («sin tope») hasta que admin_monkey se lo ponga;
-- desde entonces se hace cumplir. SQL a mano: Prisma no modela los CHECK.
ALTER TABLE platform.companies ADD CONSTRAINT companies_max_users_positive CHECK (max_users IS NULL OR max_users >= 1);
