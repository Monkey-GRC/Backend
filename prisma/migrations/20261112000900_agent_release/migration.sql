-- Un identificador de agente de la sonda se puede reciclar (D113). Aditiva: solo agrega una función.
--
-- La sonda reparte los ids de agente por su cuenta (`001`, `002`…) y reutiliza el de uno que se borró. `asset_agents.agent_id` es único en TODA la base, así que un vínculo viejo (de un
-- servidor dado de baja, de otra empresa o de un agente que ya no existe en la sonda) impedía enlazar el agente nuevo (`AGENT_ALREADY_LINKED`) aunque la sonda ya lo hubiera creado.
--
-- Si la sonda acaba de crear el agente con este id, el dueño anterior YA NO existe en ella: su vínculo es una referencia colgada. Ninguna política de RLS deja ver las filas de otras
-- empresas (con razón), así que, como `claim_next_execution` y `list_agent_reading_candidates`, lo hace una función SECURITY DEFINER angosta: solo suelta ese id (y la clave guardada)
-- de las filas que lo tengan, las marca `removed`, y devuelve cuántas fueron. No lee ni devuelve ningún dato de nadie.
CREATE OR REPLACE FUNCTION tenant.release_agent_id(p_agent_id text, p_keep_asset uuid)
RETURNS integer
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = tenant, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE tenant.asset_agents
     SET agent_id = NULL,
         status = 'removed',
         install_key_cipher = NULL,
         install_key_expires_at = NULL
   WHERE agent_id = p_agent_id
     AND asset_id <> p_keep_asset;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION tenant.release_agent_id(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION tenant.release_agent_id(text, uuid) TO monkey_app;
