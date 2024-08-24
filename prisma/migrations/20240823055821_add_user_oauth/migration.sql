-- CreateEnum
CREATE TYPE "OauthProvider" AS ENUM ('CALENDLY');

-- CreateTable
CREATE TABLE "UserOauth" (
    "id" TEXT NOT NULL,
    "userAuthId" TEXT NOT NULL,
    "provider" "OauthProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOauth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserOauth_userAuthId_provider_key" ON "UserOauth"("userAuthId", "provider");

-- AddForeignKey
ALTER TABLE "UserOauth" ADD CONSTRAINT "UserOauth_userAuthId_fkey" FOREIGN KEY ("userAuthId") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
