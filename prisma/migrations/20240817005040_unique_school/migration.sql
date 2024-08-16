/*
  Warnings:

  - A unique constraint covering the columns `[name,stage]` on the table `School` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "School_name_stage_key" ON "School"("name", "stage");
