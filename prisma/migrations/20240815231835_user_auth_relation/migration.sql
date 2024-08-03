/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_auth_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_auth_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "password",
ADD COLUMN     "user_auth_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_user_auth_id_key" ON "User"("user_auth_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_auth_id_fkey" FOREIGN KEY ("user_auth_id") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
