-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "flagName" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_flagName_key" ON "AppConfig"("flagName");

-- CreateIndex
CREATE INDEX "AppConfig_flagName_idx" ON "AppConfig"("flagName");
