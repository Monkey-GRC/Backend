-- D96 · Cuatro roles: el consultor no existe. Se retira todo lo que lo nombraba en la base, que D96 había dejado «sin uso».
--
--   1. `platform.consultant_assignments`, su trigger, su política, su función y su enum.
--   2. El valor `consultor` de `user_role`.
--   3. `evidence_reviewer_role` queda en `admin_empresa`: la revisión de la evidencia es una sola y es suya (los valores `consultor` y `auditor` ya no se usan).
--   4. `assessor_role` queda en `auditor` y `assessment_verdict` en `certified`/`not_certified` (su calificación sigue en pausa, P35); el CHECK que ataba
--      rol y veredicto se ajusta.
--   5. `evaluations.consultant_assessment` pasa a llamarse `verdict_note`: es la nota de quien da el veredicto de una prueba manual, que hoy es el `admin_empresa`.
--
-- Postgres no puede quitar un valor de un enum: se crea el tipo nuevo y se cambia la columna. Por eso, si algún dato todavía usa un valor que se retira,
-- la migración se detiene con un mensaje y no borra nada: esos datos son del rastro y los decide una persona, no un script.

DO $$
DECLARE n bigint;
BEGIN
  SELECT count(*) INTO n FROM platform.users WHERE role = 'consultor';
  IF n > 0 THEN
    RAISE EXCEPTION 'Hay % usuario(s) con el rol consultor (platform.users). Desactívalos o conviértelos antes de aplicar esta migración.', n;
  END IF;

  SELECT count(*) INTO n FROM tenant.evidence_reviews WHERE reviewer_role IN ('consultor', 'auditor');
  IF n > 0 THEN
    RAISE EXCEPTION 'Hay % revisión(es) de evidencia hechas por consultor o auditor (tenant.evidence_reviews). Revísalas antes de aplicar esta migración.', n;
  END IF;

  SELECT count(*) INTO n FROM tenant.framework_assessments WHERE assessor_role = 'consultor';
  IF n > 0 THEN
    RAISE EXCEPTION 'Hay % evaluación(es) del servicio emitidas por un consultor (tenant.framework_assessments, inmutable). Revísalas antes de aplicar esta migración.', n;
  END IF;
END $$;

-- 1. Asignaciones de consultores
DROP TABLE platform.consultant_assignments;
DROP FUNCTION platform.consultant_assignment_guard();
DROP TYPE platform.consultant_assignment_status;

-- 2. `user_role` sin `consultor`. La función de login devuelve el tipo, así que se suelta y se vuelve a crear igual.
DROP FUNCTION platform.find_login_candidates(text);

ALTER TYPE platform.user_role RENAME TO user_role_old;
CREATE TYPE platform.user_role AS ENUM ('admin_monkey', 'admin_empresa', 'funcional', 'auditor');
ALTER TABLE platform.users ALTER COLUMN role TYPE platform.user_role USING role::text::platform.user_role;
DROP TYPE platform.user_role_old;

CREATE FUNCTION platform.find_login_candidates(p_email text)
 RETURNS TABLE(id uuid, company_id uuid, password_hash text, role platform.user_role, status platform.user_status, is_mfa_enabled boolean, failed_login_attempts integer, locked_until timestamp without time zone, password_changed_at timestamp without time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'platform', 'pg_temp'
AS $function$
  SELECT id, company_id, password_hash, role, status, is_mfa_enabled,
         failed_login_attempts, locked_until, password_changed_at
  FROM platform.users
  WHERE email = lower(p_email);
$function$;
REVOKE ALL ON FUNCTION platform.find_login_candidates(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.find_login_candidates(text) TO monkey_app;

-- 3. `evidence_reviewer_role` = solo `admin_empresa`
ALTER TYPE tenant.evidence_reviewer_role RENAME TO evidence_reviewer_role_old;
CREATE TYPE tenant.evidence_reviewer_role AS ENUM ('admin_empresa');
ALTER TABLE tenant.evidence_reviews ALTER COLUMN reviewer_role TYPE tenant.evidence_reviewer_role USING reviewer_role::text::tenant.evidence_reviewer_role;
DROP TYPE tenant.evidence_reviewer_role_old;

-- 4. Evaluación del servicio: solo la del auditor (en pausa, P35). La tabla es inmutable, así que el CHECK se retira antes de cambiar los tipos.
ALTER TABLE tenant.framework_assessments DROP CONSTRAINT framework_assessments_role_verdict_check;

ALTER TYPE tenant.assessor_role RENAME TO assessor_role_old;
CREATE TYPE tenant.assessor_role AS ENUM ('auditor');
ALTER TABLE tenant.framework_assessments ALTER COLUMN assessor_role TYPE tenant.assessor_role USING assessor_role::text::tenant.assessor_role;
DROP TYPE tenant.assessor_role_old;

DO $$
DECLARE n bigint;
BEGIN
  SELECT count(*) INTO n FROM tenant.framework_assessments WHERE verdict IN ('ready', 'not_ready');
  IF n > 0 THEN
    RAISE EXCEPTION 'Hay % evaluación(es) del servicio con veredicto ready/not_ready (tenant.framework_assessments). Revísalas antes de aplicar esta migración.', n;
  END IF;
END $$;

ALTER TYPE tenant.assessment_verdict RENAME TO assessment_verdict_old;
CREATE TYPE tenant.assessment_verdict AS ENUM ('certified', 'not_certified');
ALTER TABLE tenant.framework_assessments ALTER COLUMN verdict TYPE tenant.assessment_verdict USING verdict::text::tenant.assessment_verdict;
DROP TYPE tenant.assessment_verdict_old;

ALTER TABLE tenant.framework_assessments
  ADD CONSTRAINT framework_assessments_role_verdict_check CHECK (assessor_role = 'auditor' AND verdict IN ('certified', 'not_certified'));

-- 5. La nota del veredicto
ALTER TABLE tenant.evaluations RENAME COLUMN consultant_assessment TO verdict_note;
