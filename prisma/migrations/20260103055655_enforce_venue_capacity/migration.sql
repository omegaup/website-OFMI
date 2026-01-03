-- Enforce that occupied seats never exceed capacity
ALTER TABLE "VenueQuota" ADD CONSTRAINT "check_venue_capacity" CHECK ("occupied" <= "capacity");
