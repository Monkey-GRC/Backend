-- D104 · Todo responsable vive en el grupo «Responsables» de su empresa (lo lidera el administrador); su equipo de delegados no nace con él.
-- (a) Los responsables que ya existían sin grupo (cuentas `funcional` migradas en MD-186) pasan al grupo «Responsables» de su empresa. Si la empresa no lo tiene se crea,
--     con su admin_empresa más antiguo de líder; una empresa sin ningún admin_empresa se omite (aviso, no error).
-- (b) El nombre de un grupo es único por empresa: así «Responsables» es uno solo aunque dos altas lleguen a la vez.
--
-- La migración corre como dueña de las tablas y `users` y `user_groups` tienen FORCE ROW LEVEL SECURITY: sin tenant fijado no vería filas. Se apaga FORCE solo mientras
-- dura la migración y se vuelve a encender al final; RLS sigue habilitado todo el tiempo.
ALTER TABLE platform.users NO FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.user_groups NO FORCE ROW LEVEL SECURITY;

-- (c) «Responsables» es el grupo de responsables del administrador: se reserva el nombre. Un grupo con ese nombre cuyo líder no es admin_empresa pasa a llamarse
--     «Responsables (n)» con el primer n libre de la empresa (el más antiguo primero, para que el resultado sea determinista).
DO $$
DECLARE
  g record;
  n int;
BEGIN
  FOR g IN
    SELECT ug.id, ug.company_id
    FROM platform.user_groups ug JOIN platform.users l ON l.id = ug.leader_id
    WHERE ug.name = 'Responsables' AND l.role <> 'admin_empresa'
    ORDER BY ug.created_at, ug.id
  LOOP
    n := 2;
    WHILE EXISTS (SELECT 1 FROM platform.user_groups WHERE company_id = g.company_id AND name = 'Responsables (' || n || ')') LOOP n := n + 1; END LOOP;
    UPDATE platform.user_groups SET name = 'Responsables (' || n || ')' WHERE id = g.id;
  END LOOP;
END $$;

-- (b, previo) Si algún nombre se repitiera dentro de una empresa, el más antiguo lo conserva y los demás llevan « (n)» con el primer n libre.
DO $$
DECLARE
  g record;
  n int;
BEGIN
  FOR g IN
    SELECT id, company_id, name
    FROM (SELECT id, company_id, name, created_at, row_number() OVER (PARTITION BY company_id, name ORDER BY created_at, id) AS rn FROM platform.user_groups) d
    WHERE rn > 1
    ORDER BY created_at, id
  LOOP
    n := 2;
    WHILE EXISTS (SELECT 1 FROM platform.user_groups WHERE company_id = g.company_id AND name = g.name || ' (' || n || ')') LOOP n := n + 1; END LOOP;
    UPDATE platform.user_groups SET name = g.name || ' (' || n || ')' WHERE id = g.id;
  END LOOP;
END $$;

-- (a)
DO $$
DECLARE
  c record;
  v_admin uuid;
  v_group uuid;
BEGIN
  FOR c IN SELECT DISTINCT company_id FROM platform.users WHERE role = 'responsable' AND group_id IS NULL LOOP
    SELECT id INTO v_group FROM platform.user_groups WHERE company_id = c.company_id AND name = 'Responsables';
    IF v_group IS NULL THEN
      SELECT id INTO v_admin FROM platform.users WHERE company_id = c.company_id AND role = 'admin_empresa' ORDER BY created_at, id LIMIT 1;
      IF v_admin IS NULL THEN
        RAISE NOTICE 'Empresa % omitida: tiene responsables sin grupo y ningún admin_empresa que lidere «Responsables»', c.company_id;
        CONTINUE;
      END IF;
      INSERT INTO platform.user_groups (id, company_id, name, leader_id) VALUES (gen_random_uuid(), c.company_id, 'Responsables', v_admin) RETURNING id INTO v_group;
    END IF;
    UPDATE platform.users SET group_id = v_group WHERE company_id = c.company_id AND role = 'responsable' AND users.group_id IS NULL;
  END LOOP;
END $$;

-- (b)
CREATE UNIQUE INDEX IF NOT EXISTS "user_groups_company_id_name_key" ON "platform"."user_groups"("company_id", "name");

ALTER TABLE platform.users FORCE ROW LEVEL SECURITY;
ALTER TABLE platform.user_groups FORCE ROW LEVEL SECURITY;
