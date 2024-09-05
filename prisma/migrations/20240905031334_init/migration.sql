-- CreateEnum
CREATE TYPE "OauthProvider" AS ENUM ('CALENDLY');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SchoolStage" AS ENUM ('ELEMENTARY', 'SECONDARY', 'HIGH');

-- CreateEnum
CREATE TYPE "ParticipationRole" AS ENUM ('CONTESTANT', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "ShirtSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" "SchoolStage" NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailingAddress" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "externalNumber" TEXT NOT NULL,
    "internalNumber" TEXT,
    "zipcode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "references" TEXT,
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
    "userAuthId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "governmentId" TEXT NOT NULL,
    "preferredName" TEXT NOT NULL,
    "pronouns" TEXT NOT NULL,
    "shirtSize" "ShirtSize" NOT NULL,
    "shirtStyle" TEXT NOT NULL,
    "mailingAddressId" TEXT NOT NULL,
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
    "highSchoolGraduationDateLimit" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ofmi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ofmiId" TEXT NOT NULL,
    "role" "ParticipationRole" NOT NULL,
    "volunteerParticipationId" TEXT,
    "contestantParticipationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestantParticipation" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "schoolGrade" INTEGER NOT NULL,
    "medal" TEXT,
    "place" INTEGER,
    "disqualified" BOOLEAN NOT NULL,
    "omegaupUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestantParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerParticipation" (
    "id" TEXT NOT NULL,
    "educationalLinkageOptIn" BOOLEAN NOT NULL,
    "fundraisingOptIn" BOOLEAN NOT NULL,
    "communityOptIn" BOOLEAN NOT NULL,
    "trainerOptIn" BOOLEAN NOT NULL,
    "problemSetterOptIn" BOOLEAN NOT NULL,
    "mentorOptIn" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemResult" (
    "omegaupAlias" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "contestantParticipantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemResult_pkey" PRIMARY KEY ("omegaupAlias")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "contestantParticipantId" TEXT NOT NULL,
    "contestantComment" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OmegaupContest" (
    "omegaupAlias" TEXT NOT NULL,
    "ofmiId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OmegaupContest_pkey" PRIMARY KEY ("omegaupAlias")
);

-- CreateTable
CREATE TABLE "OmegaupUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OmegaupUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_email_key" ON "UserAuth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserOauth_userAuthId_provider_key" ON "UserOauth"("userAuthId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "School_name_stage_state_country_key" ON "School"("name", "stage", "state", "country");

-- CreateIndex
CREATE UNIQUE INDEX "User_userAuthId_key" ON "User"("userAuthId");

-- CreateIndex
CREATE UNIQUE INDEX "User_mailingAddressId_key" ON "User"("mailingAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "Ofmi_edition_key" ON "Ofmi"("edition");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_userId_ofmiId_key" ON "Participation"("userId", "ofmiId");

-- CreateIndex
CREATE UNIQUE INDEX "OmegaupUser_username_key" ON "OmegaupUser"("username");

-- AddForeignKey
ALTER TABLE "UserOauth" ADD CONSTRAINT "UserOauth_userAuthId_fkey" FOREIGN KEY ("userAuthId") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userAuthId_fkey" FOREIGN KEY ("userAuthId") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mailingAddressId_fkey" FOREIGN KEY ("mailingAddressId") REFERENCES "MailingAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_ofmiId_fkey" FOREIGN KEY ("ofmiId") REFERENCES "Ofmi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_volunteerParticipationId_fkey" FOREIGN KEY ("volunteerParticipationId") REFERENCES "VolunteerParticipation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_contestantParticipationId_fkey" FOREIGN KEY ("contestantParticipationId") REFERENCES "ContestantParticipation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestantParticipation" ADD CONSTRAINT "ContestantParticipation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestantParticipation" ADD CONSTRAINT "ContestantParticipation_omegaupUserId_fkey" FOREIGN KEY ("omegaupUserId") REFERENCES "OmegaupUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemResult" ADD CONSTRAINT "ProblemResult_contestantParticipantId_fkey" FOREIGN KEY ("contestantParticipantId") REFERENCES "ContestantParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_contestantParticipantId_fkey" FOREIGN KEY ("contestantParticipantId") REFERENCES "ContestantParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OmegaupContest" ADD CONSTRAINT "OmegaupContest_ofmiId_fkey" FOREIGN KEY ("ofmiId") REFERENCES "Ofmi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
