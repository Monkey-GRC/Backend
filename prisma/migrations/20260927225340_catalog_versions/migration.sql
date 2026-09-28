-- CreateTable
CREATE TABLE "catalog"."catalog_versions" (
    "id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "published_at" DATE NOT NULL,
    "change_summary" TEXT NOT NULL,
    "published_by" UUID NOT NULL,
    "propagated_automatically" BOOLEAN NOT NULL,
    "requires_acceptance" BOOLEAN NOT NULL,

    CONSTRAINT "catalog_versions_pkey" PRIMARY KEY ("id")
);
