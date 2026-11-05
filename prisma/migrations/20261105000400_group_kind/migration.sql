-- D104 / MD-189 · Un grupo tiene una clase: `responsables` (lo lidera el admin_empresa) o `team` (el equipo de delegados de un responsable).
-- Un responsable lidera a lo sumo UN `team`: lo garantiza un índice único parcial, no solo el código.
--
-- La migración corre como dueña de las tablas y `users` y `user_groups` tienen FORCE ROW LEVEL SECURITY: sin tenant fijado no vería filas. Se apaga FORCE solo mientras
-- dura la migración (su transacción) y se vuelve a encender al final; RLS sigue habilitado todo el tiempo. Es idempotente: repetirla no falla ni cambia nada.
ALTER TABLE platform.users NO FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.user_groups NO FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE TYPE "platform"."group_kind" AS ENUM ('responsables', 'team');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "platform"."user_groups" ADD COLUMN IF NOT EXISTS "kind" "platform"."group_kind";

-- (a) Backfill: el grupo que lidera un responsable es un `team`; el que lidera un admin_empresa, de `responsables`. Un líder de otro rol no debería existir (el esquema
--     solo deja liderar a admin_empresa y responsable): si lo hubiera, el grupo queda `responsables` y se avisa.
DO $$
DECLARE
  odd int;
BEGIN
  UPDATE platform.user_groups ug SET kind = CASE WHEN l.role = 'responsable' THEN 'team'::platform.group_kind ELSE 'responsables'::platform.group_kind END
  FROM platform.users l WHERE l.id = ug.leader_id AND ug.kind IS NULL;
  SELECT count(*) INTO odd FROM platform.user_groups ug JOIN platform.users l ON l.id = ug.leader_id WHERE l.role NOT IN ('admin_empresa', 'responsable');
  IF odd > 0 THEN RAISE NOTICE '% grupo(s) con un líder que no es admin_empresa ni responsable: quedan como `responsables`', odd; END IF;
END $$;

-- (b) Un responsable lidera un solo `team`. Si ya hubiera dos o más (el más antiguo manda), no se borra nada: los miembros de los demás pasan al más antiguo y cada
--     grupo sobrante, ya vacío, se conserva con el nombre « (fusionado n)», liderado por un admin_empresa de la empresa (activo antes que pendiente y pendiente antes que cualquier otro; el más antiguo de cada tipo) y como `responsables`.
--     Una empresa con ese caso y sin admin_empresa aborta la migración (se resuelve a mano) en vez de adivinar.
DO $$
DECLARE
  g record;
  v_keep uuid;
  v_admin uuid;
  n int;
BEGIN
  FOR g IN
    SELECT id, company_id, leader_id, name
    FROM (SELECT id, company_id, leader_id, name, created_at, row_number() OVER (PARTITION BY leader_id ORDER BY created_at, id) AS rn FROM platform.user_groups WHERE kind = 'team') d
    WHERE rn > 1
    ORDER BY created_at, id
  LOOP
    SELECT id INTO v_keep FROM platform.user_groups WHERE leader_id = g.leader_id AND kind = 'team' ORDER BY created_at, id LIMIT 1;
    SELECT id INTO v_admin FROM platform.users WHERE company_id = g.company_id AND role = 'admin_empresa' ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END, created_at, id LIMIT 1;
    IF v_admin IS NULL THEN
      RAISE EXCEPTION 'La empresa % tiene un responsable con más de un equipo y ningún admin_empresa: resuélvelo a mano antes de migrar', g.company_id;
    END IF;
    n := 1;
    WHILE EXISTS (SELECT 1 FROM platform.user_groups WHERE company_id = g.company_id AND name = g.name || ' (fusionado ' || n || ')') LOOP n := n + 1; END LOOP;
    UPDATE platform.users SET group_id = v_keep WHERE group_id = g.id;
    UPDATE platform.user_groups SET kind = 'responsables', leader_id = v_admin, name = g.name || ' (fusionado ' || n || ')' WHERE id = g.id;
    RAISE NOTICE 'Empresa %: el equipo % se fusionó en % y quedó vacío como «%»', g.company_id, g.id, v_keep, g.name || ' (fusionado ' || n || ')';
  END LOOP;
END $$;

ALTER TABLE "platform"."user_groups" ALTER COLUMN "kind" SET NOT NULL;

-- Lo que Prisma no expresa: un solo `team` por responsable.
CREATE UNIQUE INDEX IF NOT EXISTS "user_groups_one_team_per_leader" ON "platform"."user_groups"("leader_id") WHERE "kind" = 'team';

ALTER TABLE platform.users FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.user_groups FORCE ROW LEVEL SECURITY;
