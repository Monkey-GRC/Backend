-- D95, D96 · SQL a mano, aparte del cambio de schema (20261028000152), porque Prisma no modela RLS ni funciones y la validación contra la shadow falla si se mezclan.

-- 1. RLS de los códigos de activación ---------------------------------------------------------------------------------------------------------------
-- Mismo patrón que el resto de platform: se ve y se escribe lo del propio tenant. El código pertenece a la empresa de la cuenta que se activa, que es el tenant con el
-- que actúa el admin_empresa al crearlo.
ALTER TABLE platform.user_activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.user_activation_codes FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON platform.user_activation_codes
  USING (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (company_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- 2. La búsqueda previa al tenant -------------------------------------------------------------------------------------------------------------------
-- Quien activa su cuenta llega solo con el código (igual que find_access_key). SECURITY DEFINER y angosta: devuelve qué código es y de quién; todo lo demás
-- se lee ya con RLS, fijando el tenant con el company_id devuelto.
CREATE FUNCTION platform.find_activation_code(p_code_hash text)
RETURNS TABLE (
  id         uuid,
  company_id uuid,
  user_id    uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = platform, pg_temp
AS $$
  SELECT id, company_id, user_id
  FROM platform.user_activation_codes
  WHERE code_hash = p_code_hash;
$$;

REVOKE ALL ON FUNCTION platform.find_activation_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.find_activation_code(text) TO monkey_app;