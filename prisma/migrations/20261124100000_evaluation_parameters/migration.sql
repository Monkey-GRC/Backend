-- MD-495, RC-19 · Los parámetros del motor de evaluación pasan de código a tabla. Aditiva: tabla y enum nuevos más la semilla (los valores del libro, §9 «Los parámetros»; único lugar con estos números).
-- CreateEnum
CREATE TYPE "catalog"."evaluation_parameter_unit" AS ENUM ('percent', 'days', 'hours', 'months', 'count', 'boolean', 'days_by_periodicity', 'window_mode');

-- CreateTable
CREATE TABLE "catalog"."evaluation_parameters" (
    "key" TEXT NOT NULL,
    "code" TEXT,
    "unit" "catalog"."evaluation_parameter_unit" NOT NULL,
    "value" JSONB NOT NULL,
    "default_value" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" UUID,

    CONSTRAINT "evaluation_parameters_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "catalog"."evaluation_parameters" ADD CONSTRAINT "evaluation_parameters_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "platform"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Semilla (valor = valor por defecto)
INSERT INTO "catalog"."evaluation_parameters" ("key", "code", "unit", "value", "default_value", "sort_order") VALUES
  ('partial_threshold', 'PR-01', 'percent', '75', '75', 1),
  ('weak_threshold', 'PR-02', 'percent', '40', '40', 2),
  ('asset_coverage', 'PR-03', 'percent', '100', '100', 3),
  ('check_exception_max_days', 'PR-04', 'days', '90', '90', 4),
  ('freshness_hours', 'PR-05', 'hours', '24', '24', 5),
  ('alert_days_before', 'PR-06', 'days_by_periodicity', '{"daily": 0, "weekly": 2, "monthly": 5, "bimonthly": 10, "quarterly": 15, "semiannual": 20, "annual": 30}', '{"daily": 0, "weekly": 2, "monthly": 5, "bimonthly": 10, "quarterly": 15, "semiannual": 20, "annual": 30}', 6),
  ('on_demand_alert_days', 'PR-06', 'days', '15', '15', 7),
  ('validity_windows', 'PR-07', 'window_mode', '"calendar"', '"calendar"', 8),
  ('risk_partial_mitigation_coverage', 'PR-08', 'percent', '60', '60', 9),
  ('risk_demonstrated_mitigation_coverage', 'PR-09', 'percent', '85', '85', 10),
  ('impact_reduction_enabled', 'PR-10', 'boolean', 'false', 'false', 11),
  ('approval_max_steps', 'PR-11', 'count', '5', '5', 12),
  ('approval_max_approvers_per_step', 'PR-12', 'count', '3', '3', 13),
  ('submitter_sole_approver_allowed', 'PR-13', 'boolean', 'false', 'false', 14),
  ('document_acceptance_days', 'PR-14', 'days', '30', '30', 15),
  ('document_acceptance_required', 'PR-15', 'percent', '100', '100', 16),
  ('audited_period_min_months', 'PR-16', 'months', '6', '6', 17),
  ('score_threshold', NULL, 'percent', '80', '80', 18),
  ('solid_asset_coverage', NULL, 'percent', '100', '100', 19);
