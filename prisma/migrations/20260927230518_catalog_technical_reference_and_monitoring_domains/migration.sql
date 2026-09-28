-- CreateTable
CREATE TABLE "catalog"."automated_capabilities" (
    "id" UUID NOT NULL,
    "catalog_code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "supported_platforms" JSONB NOT NULL,
    "method" TEXT NOT NULL,
    "required_permissions" JSONB NOT NULL,
    "provider" TEXT NOT NULL,
    "base_frequency" TEXT NOT NULL,
    "generated_evidence" TEXT NOT NULL,
    "monitoring_domain_id" UUID NOT NULL,

    CONSTRAINT "automated_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."monitoring_domains" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "monitored_scope" TEXT NOT NULL,
    "covered_criterion" TEXT NOT NULL,
    "generated_evidence" TEXT NOT NULL,

    CONSTRAINT "monitoring_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."_MonitoringDomainToRequirement" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MonitoringDomainToRequirement_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "automated_capabilities_catalog_code_key" ON "catalog"."automated_capabilities"("catalog_code");

-- CreateIndex
CREATE INDEX "_MonitoringDomainToRequirement_B_index" ON "catalog"."_MonitoringDomainToRequirement"("B");

-- AddForeignKey
ALTER TABLE "catalog"."automated_capabilities" ADD CONSTRAINT "automated_capabilities_monitoring_domain_id_fkey" FOREIGN KEY ("monitoring_domain_id") REFERENCES "catalog"."monitoring_domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_MonitoringDomainToRequirement" ADD CONSTRAINT "_MonitoringDomainToRequirement_A_fkey" FOREIGN KEY ("A") REFERENCES "catalog"."monitoring_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."_MonitoringDomainToRequirement" ADD CONSTRAINT "_MonitoringDomainToRequirement_B_fkey" FOREIGN KEY ("B") REFERENCES "catalog"."requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
