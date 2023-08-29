-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('student', 'dean');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "full_name" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "university_id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "role" "RoleEnum" NOT NULL,
    "session_signature" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deanId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_university_id_key" ON "user"("university_id");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_deanId_fkey" FOREIGN KEY ("deanId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
