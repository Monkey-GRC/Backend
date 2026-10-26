-- Los textos del comité de una prueba nombraban al proveedor de las sondas (Wazuh) y a un tercero (Vanta). Aunque solo los ve el personal de Monkey en el Admin,
-- ningún texto nombra a un proveedor ni a un tercero (SEG-39, D70, D92): pasan a decir «la sonda» o «una plataforma GRC». Solo cambia el nombre, no el sentido.
-- El mismo reemplazo está en prisma/seed/data/soc2-catalog.json para que `catalog:load` y `catalog:verify` no lo deshagan.
CREATE FUNCTION pg_temp.neutral_provider(t text) RETURNS text LANGUAGE sql IMMUTABLE AS $f$
  SELECT regexp_replace(
           regexp_replace(
             regexp_replace(
               regexp_replace(
                 regexp_replace(t, '\s+como Vanta\M', '', 'gi'),
                 '\mVanta\M', 'una plataforma GRC', 'gi'),
               '\m(agentes?)\s+Wazuh\M', '\1 de la sonda', 'gi'),
             '(^|"|[.!?]\s+|\n)Wazuh\M', '\1La sonda', 'gi'),
           '\mWazuh\M', 'la sonda', 'gi')
$f$;

UPDATE "catalog"."tests" SET
  "name" = pg_temp.neutral_provider("name"),
  "objective" = pg_temp.neutral_provider("objective"),
  "tool" = pg_temp.neutral_provider("tool"),
  "population" = pg_temp.neutral_provider("population"),
  "suggested_sample_size" = pg_temp.neutral_provider("suggested_sample_size"),
  "evidence_to_request" = pg_temp.neutral_provider("evidence_to_request"),
  "prerequisites" = pg_temp.neutral_provider("prerequisites"),
  "step_by_step" = pg_temp.neutral_provider("step_by_step"::text)::jsonb,
  "compliance_criterion" = pg_temp.neutral_provider("compliance_criterion"),
  "limitations" = pg_temp.neutral_provider("limitations"),
  "exceptions" = pg_temp.neutral_provider("exceptions"),
  "automated_coverage" = pg_temp.neutral_provider("automated_coverage"),
  "complementary_manual_validation" = pg_temp.neutral_provider("complementary_manual_validation"),
  "evidence_to_retain" = pg_temp.neutral_provider("evidence_to_retain"),
  "attributes_to_validate" = pg_temp.neutral_provider("attributes_to_validate"::text)::jsonb
WHERE concat_ws(' ', "name", "objective", "tool", "population", "suggested_sample_size", "evidence_to_request", "prerequisites", "step_by_step"::text,
                "compliance_criterion", "limitations", "exceptions", "automated_coverage", "complementary_manual_validation", "evidence_to_retain",
                "attributes_to_validate"::text) ~* '(wazuh|vanta)';