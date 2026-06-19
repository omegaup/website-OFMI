/*
  Warnings:

  - Added the required column `externalUserId` to the `UserOauth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserOauth" ADD COLUMN     "externalUserId" TEXT;
