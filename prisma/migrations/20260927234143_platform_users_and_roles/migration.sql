-- CreateEnum
CREATE TYPE "platform"."UserRole" AS ENUM ('admin_monkey', 'admin_empresa', 'funcional', 'auditor');

-- CreateEnum
CREATE TYPE "platform"."UserStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "platform"."ApiKeyStatus" AS ENUM ('active', 'revoked');

-- CreateTable
CREATE TABLE "platform"."users" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "custom_role_id" UUID,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "platform"."UserRole" NOT NULL,
    "status" "platform"."UserStatus" NOT NULL DEFAULT 'active',
    "is_mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."custom_roles" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."user_control_assignments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "client_control_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_control_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."auditor_assignments" (
    "id" UUID NOT NULL,
    "auditor_user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "auditor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."api_keys" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "status" "platform"."ApiKeyStatus" NOT NULL DEFAULT 'active',
    "last_rotated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_company_id_email_key" ON "platform"."users"("company_id", "email");

-- AddForeignKey
ALTER TABLE "catalog"."catalog_versions" ADD CONSTRAINT "catalog_versions_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."access_keys" ADD CONSTRAINT "access_keys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."users" ADD CONSTRAINT "users_custom_role_id_fkey" FOREIGN KEY ("custom_role_id") REFERENCES "platform"."custom_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."custom_roles" ADD CONSTRAINT "custom_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."user_control_assignments" ADD CONSTRAINT "user_control_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."user_control_assignments" ADD CONSTRAINT "user_control_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."auditor_assignments" ADD CONSTRAINT "auditor_assignments_auditor_user_id_fkey" FOREIGN KEY ("auditor_user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."auditor_assignments" ADD CONSTRAINT "auditor_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."auditor_assignments" ADD CONSTRAINT "auditor_assignments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."api_keys" ADD CONSTRAINT "api_keys_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "platform"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."api_keys" ADD CONSTRAINT "api_keys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "platform"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
