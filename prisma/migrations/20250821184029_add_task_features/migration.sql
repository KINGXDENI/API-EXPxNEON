/*
  Warnings:

  - Added the required column `position` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PriorityLevel" AS ENUM ('RENDAH', 'SEDANG', 'PENTING');

-- AlterTable
ALTER TABLE "public"."tasks" ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "position" INTEGER NOT NULL,
ADD COLUMN     "priority" "public"."PriorityLevel" NOT NULL DEFAULT 'SEDANG';
