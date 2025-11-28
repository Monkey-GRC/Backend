-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT_ADMIN', 'USER', 'VIEWER', 'MONKEY_ADMIN');

-- CreateTable
CREATE TABLE "mnk_clients" (
    "id" UUID NOT NULL,
    "tax_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "mnk_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_controls" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "code" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "mnk_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_reasons" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "mnk_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_risks" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "mnk_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "scope" TEXT,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "mnk_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnk_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "last_name" TEXT,
    "username" TEXT NOT NULL,
    "client_id" UUID,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "refresh_token_hash" TEXT,
    "refresh_token_expires_at" TIMESTAMP(3),

    CONSTRAINT "mnk_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_mnk_client_templates" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_mnk_client_templates_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "mnk_clients_tax_id_key" ON "mnk_clients"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_clients_api_key_key" ON "mnk_clients"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_controls_code_key" ON "mnk_controls"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_reasons_code_key" ON "mnk_reasons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_risks_code_key" ON "mnk_risks"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_templates_slug_key" ON "mnk_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_users_email_key" ON "mnk_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mnk_users_username_key" ON "mnk_users"("username");

-- CreateIndex
CREATE INDEX "_mnk_client_templates_B_index" ON "_mnk_client_templates"("B");

-- AddForeignKey
ALTER TABLE "mnk_reasons" ADD CONSTRAINT "mnk_reasons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_reasons" ADD CONSTRAINT "mnk_reasons_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_risks" ADD CONSTRAINT "mnk_risks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_risks" ADD CONSTRAINT "mnk_risks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_templates" ADD CONSTRAINT "mnk_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_templates" ADD CONSTRAINT "mnk_templates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "mnk_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnk_users" ADD CONSTRAINT "mnk_users_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "mnk_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mnk_client_templates" ADD CONSTRAINT "_mnk_client_templates_A_fkey" FOREIGN KEY ("A") REFERENCES "mnk_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mnk_client_templates" ADD CONSTRAINT "_mnk_client_templates_B_fkey" FOREIGN KEY ("B") REFERENCES "mnk_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
