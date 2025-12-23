ALTER TABLE "ContestantParticipation" ADD COLUMN     "venueQuotaId" TEXT;

CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "googleMapsUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VenueQuota" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "ofmiId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueQuota_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VenueQuota_venueId_ofmiId_key" ON "VenueQuota"("venueId", "ofmiId");

ALTER TABLE "ContestantParticipation" ADD CONSTRAINT "ContestantParticipation_venueQuotaId_fkey" FOREIGN KEY ("venueQuotaId") REFERENCES "VenueQuota"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VenueQuota" ADD CONSTRAINT "VenueQuota_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "VenueQuota" ADD CONSTRAINT "VenueQuota_ofmiId_fkey" FOREIGN KEY ("ofmiId") REFERENCES "Ofmi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
