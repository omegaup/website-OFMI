-- CreateEnum
CREATE TYPE "MentoriaStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'NO_SHOW', 'COMPLETED');

-- CreateTable
CREATE TABLE "Mentoria" (
    "id" TEXT NOT NULL,
    "volunteerParticipationId" TEXT NOT NULL,
    "contestantParticipantId" TEXT NOT NULL,
    "meetingTime" TIMESTAMP(3) NOT NULL,
    "status" "MentoriaStatus" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mentoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mentoria_volunteerParticipationId_contestantParticipantId_m_key" ON "Mentoria"("volunteerParticipationId", "contestantParticipantId", "meetingTime");

-- AddForeignKey
ALTER TABLE "Mentoria" ADD CONSTRAINT "Mentoria_volunteerParticipationId_fkey" FOREIGN KEY ("volunteerParticipationId") REFERENCES "VolunteerParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentoria" ADD CONSTRAINT "Mentoria_contestantParticipantId_fkey" FOREIGN KEY ("contestantParticipantId") REFERENCES "ContestantParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
