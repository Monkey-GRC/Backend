-- CreateTable
CREATE TABLE "mnk_cis_check_translations" (
    "check_id" TEXT NOT NULL,
    "title_es" TEXT NOT NULL,
    "description_es" TEXT,
    "rationale_es" TEXT,
    "remediation_es" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mnk_cis_check_translations_pkey" PRIMARY KEY ("check_id")
);
