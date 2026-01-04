-- AlterTable
ALTER TABLE "VenueQuota" ADD COLUMN     "occupied" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "capacity" SET DEFAULT 50;

-- Add Check Constraint
ALTER TABLE "VenueQuota" ADD CONSTRAINT "check_venue_capacity" CHECK ("occupied" <= "capacity");
