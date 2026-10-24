-- Evaluaciones inmutables en la base de datos para TODOS los roles (MD-145, SEG-38).
--
-- Hasta ahora solo `monkey_app` tenía revocado UPDATE/DELETE/TRUNCATE sobre `tenant.evaluations` (con un GRANT
-- por columna para el cierre humano). El dueño de la tabla (el rol de las migraciones) y cualquier otro rol con
-- permisos podían reescribir el histórico, y la certificación SOC 2 Tipo II exige poder demostrar que no se hizo.
-- Estos triggers lo imponen igual que a `audit` (MD-92): una evaluación se agrega y nunca se edita ni se borra.
--
-- La única excepción es el cierre humano (§7.5): `confirmed_by` y `closure_observation_reason`, que no cambian
-- lo medido. El UPDATE se compara fila contra fila sin esas dos columnas, de modo que una columna nueva de
-- `evaluations` queda protegida sin tocar esta función.
--
-- No toca ninguna fila existente. Solo SQL (sin cambios de schema de Prisma), según la convención de no
-- mezclarlos en una misma migración.

CREATE OR REPLACE FUNCTION tenant.reject_evaluation_mutation() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND (to_jsonb(NEW) - 'confirmed_by' - 'closure_observation_reason')
         IS NOT DISTINCT FROM (to_jsonb(OLD) - 'confirmed_by' - 'closure_observation_reason') THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'tenant.% es inmutable: % no está permitido (solo el cierre humano puede completar confirmed_by y closure_observation_reason)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege',
          HINT = 'Una evaluación no se edita ni se borra; si cambia lo medido se agrega una evaluación nueva.';
END;
$$;

-- Por fila: UPDATE (salvo el cierre humano) y DELETE.
CREATE TRIGGER evaluations_immutable
  BEFORE UPDATE OR DELETE ON tenant.evaluations
  FOR EACH ROW EXECUTE FUNCTION tenant.reject_evaluation_mutation();

-- Por sentencia: TRUNCATE no dispara los triggers por fila.
CREATE TRIGGER evaluations_no_truncate
  BEFORE TRUNCATE ON tenant.evaluations
  FOR EACH STATEMENT EXECUTE FUNCTION tenant.reject_evaluation_mutation();
