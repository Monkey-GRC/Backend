-- Los tipos enum quedaron en PascalCase ("UserRole"): en Postgres exigen comillas dobles
-- y rompen la convención snake_case de modelo-datos.md. Se renombran los 41 con @@map en
-- el schema Prisma. El cliente generado no cambia (los nombres TS siguen igual).
-- ALTER TYPE ... RENAME conserva el OID: funciones y columnas que lo usan no se rompen.

ALTER TYPE "audit"."AuditResult" RENAME TO "audit_result";
ALTER TYPE "catalog"."Dimension" RENAME TO "dimension";
ALTER TYPE "catalog"."ControlDimensionType" RENAME TO "control_dimension_type";
ALTER TYPE "catalog"."TrustCriterionCode" RENAME TO "trust_criterion_code";
ALTER TYPE "catalog"."FailureCategory" RENAME TO "failure_category";
ALTER TYPE "catalog"."TestPlanOrigin" RENAME TO "test_plan_origin";
ALTER TYPE "catalog"."CheckOrigin" RENAME TO "check_origin";
ALTER TYPE "platform"."IsolationStrategy" RENAME TO "isolation_strategy";
ALTER TYPE "platform"."CompanyStatus" RENAME TO "company_status";
ALTER TYPE "platform"."AccessKeyStatus" RENAME TO "access_key_status";
ALTER TYPE "platform"."UserRole" RENAME TO "user_role";
ALTER TYPE "platform"."UserStatus" RENAME TO "user_status";
ALTER TYPE "platform"."ApiKeyStatus" RENAME TO "api_key_status";
ALTER TYPE "tenant"."EvaluationResult" RENAME TO "evaluation_result";
ALTER TYPE "tenant"."RawProbeResult" RENAME TO "raw_probe_result";
ALTER TYPE "tenant"."FindingStatus" RENAME TO "finding_status";
ALTER TYPE "tenant"."FindingOrigin" RENAME TO "finding_origin";
ALTER TYPE "tenant"."RiskTreatmentDecision" RENAME TO "risk_treatment_decision";
ALTER TYPE "tenant"."VulnerabilityStatus" RENAME TO "vulnerability_status";
ALTER TYPE "tenant"."OrganizationSize" RENAME TO "organization_size";
ALTER TYPE "tenant"."Industry" RENAME TO "industry";
ALTER TYPE "tenant"."BusinessModel" RENAME TO "business_model";
ALTER TYPE "tenant"."YearsInOperation" RENAME TO "years_in_operation";
ALTER TYPE "tenant"."IncorporationCountry" RENAME TO "incorporation_country";
ALTER TYPE "tenant"."ClientCountry" RENAME TO "client_country";
ALTER TYPE "tenant"."ComplianceMaturity" RENAME TO "compliance_maturity";
ALTER TYPE "tenant"."OrganizationResponsibleType" RENAME TO "organization_responsible_type";
ALTER TYPE "tenant"."SubserviceProviderType" RENAME TO "subservice_provider_type";
ALTER TYPE "tenant"."ServiceType" RENAME TO "service_type";
ALTER TYPE "tenant"."ServedIndustry" RENAME TO "served_industry";
ALTER TYPE "tenant"."ActiveClientCount" RENAME TO "active_client_count";
ALTER TYPE "tenant"."ServiceCountry" RENAME TO "service_country";
ALTER TYPE "tenant"."DataType" RENAME TO "data_type";
ALTER TYPE "tenant"."ExpectedAvailability" RENAME TO "expected_availability";
ALTER TYPE "tenant"."DeploymentScenario" RENAME TO "deployment_scenario";
ALTER TYPE "tenant"."PreviousCertification" RENAME TO "previous_certification";
ALTER TYPE "tenant"."AssetConnectionCategory" RENAME TO "asset_connection_category";
ALTER TYPE "tenant"."AssetOperationalStatus" RENAME TO "asset_operational_status";
ALTER TYPE "tenant"."ExecutionOrigin" RENAME TO "execution_origin";
ALTER TYPE "tenant"."CheckResultStatus" RENAME TO "check_result_status";
ALTER TYPE "tenant"."ExecutionLogLevel" RENAME TO "execution_log_level";
