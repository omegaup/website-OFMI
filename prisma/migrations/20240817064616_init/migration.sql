-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "SchoolStage" AS ENUM ('Elementary', 'Secondary', 'High');

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" "SchoolStage" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipationRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParticipationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailingAddress" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "external_number" TEXT NOT NULL,
    "internal_number" TEXT,
    "zip_code" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "user_auth_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "government_id" TEXT NOT NULL,
    "preferred_name" TEXT NOT NULL,
    "pronouns" TEXT NOT NULL,
    "shirt_size" TEXT NOT NULL,
    "shirt_style" TEXT NOT NULL,
    "mailing_address_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ofmi" (
    "id" TEXT NOT NULL,
    "edition" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "registrationOpenTime" TIMESTAMP(3) NOT NULL,
    "registrationCloseTime" TIMESTAMP(3) NOT NULL,
    "birthDateRequirement" TIMESTAMP(3),
    "studyingHighScoolDateRequirement" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ofmi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ofmi_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "mentor_participation_id" TEXT,
    "contestant_participation_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestantParticipation" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "school_grade" INTEGER NOT NULL,
    "medal" TEXT,
    "place" INTEGER,
    "disqualified" BOOLEAN NOT NULL,
    "omegaup_user_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestantParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemResult" (
    "omegaup_alias" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "contestant_participant_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemResult_pkey" PRIMARY KEY ("omegaup_alias")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "contestant_participant_id" TEXT NOT NULL,
    "contestant_comment" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OmegaupContest" (
    "omegaup_alias" TEXT NOT NULL,
    "ofmi_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OmegaupContest_pkey" PRIMARY KEY ("omegaup_alias")
);

-- CreateTable
CREATE TABLE "OmegaupUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OmegaupUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_email_key" ON "UserAuth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "School_name_stage_key" ON "School"("name", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipationRole_name_key" ON "ParticipationRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_auth_id_key" ON "User"("user_auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_mailing_address_id_key" ON "User"("mailing_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "Ofmi_edition_key" ON "Ofmi"("edition");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_user_id_ofmi_id_role_id_key" ON "Participation"("user_id", "ofmi_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "OmegaupUser_username_key" ON "OmegaupUser"("username");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_auth_id_fkey" FOREIGN KEY ("user_auth_id") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mailing_address_id_fkey" FOREIGN KEY ("mailing_address_id") REFERENCES "MailingAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_ofmi_id_fkey" FOREIGN KEY ("ofmi_id") REFERENCES "Ofmi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "ParticipationRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_mentor_participation_id_fkey" FOREIGN KEY ("mentor_participation_id") REFERENCES "Participation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_contestant_participation_id_fkey" FOREIGN KEY ("contestant_participation_id") REFERENCES "ContestantParticipation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestantParticipation" ADD CONSTRAINT "ContestantParticipation_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestantParticipation" ADD CONSTRAINT "ContestantParticipation_omegaup_user_id_fkey" FOREIGN KEY ("omegaup_user_id") REFERENCES "OmegaupUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemResult" ADD CONSTRAINT "ProblemResult_contestant_participant_id_fkey" FOREIGN KEY ("contestant_participant_id") REFERENCES "ContestantParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_contestant_participant_id_fkey" FOREIGN KEY ("contestant_participant_id") REFERENCES "ContestantParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OmegaupContest" ADD CONSTRAINT "OmegaupContest_ofmi_id_fkey" FOREIGN KEY ("ofmi_id") REFERENCES "Ofmi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
