/*
  Warnings:

  - A unique constraint covering the columns `[mailing_address_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `UserAuth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MailingAddress" ALTER COLUMN "internal_number" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserAuth" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_mailing_address_id_key" ON "User"("mailing_address_id");
