import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMocks } from "node-mocks-http";
import venuesHandler from "@/pages/api/ofmi/venues";
import { prisma } from "@/lib/prisma";
import { VenueQuota } from "@/types/venue.schema";

describe("/api/ofmi/venues API Endpoint", () => {
  const testOfmiEdition = 1;
  let ofmiId: string;
  let venueId: string;

  beforeAll(async () => {
    const ofmi = await prisma.ofmi.upsert({
      where: { edition: testOfmiEdition },
      update: {},
      create: {
        edition: testOfmiEdition,
        year: 2027,
        registrationOpenTime: new Date(),
        registrationCloseTime: new Date(),
      },
    });
    ofmiId = ofmi.id;

    const venue = await prisma.venue.create({
      data: {
        name: "Sede de Prueba Unit Test",
        address: "Calle Falsa 123",
        state: "CDMX",
      },
    });
    venueId = venue.id;

    await prisma.venueQuota.create({
      data: {
        venueId: venue.id,
        ofmiId: ofmi.id,
        capacity: 10,
      },
    });
  });

  afterAll(async () => {
    await prisma.venueQuota.deleteMany({ where: { ofmiId } });
    await prisma.venue.delete({ where: { id: venueId } });
  });

  it("should return venues for specific edition", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { ofmiEdition: testOfmiEdition.toString() },
    });

    await venuesHandler(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();

    // Find our specific test venue
    const foundVenue = data.venues.find(
      (v: VenueQuota) => v.venueId === venueId,
    );
    expect(foundVenue).toBeDefined();
    expect(foundVenue.venue.name).toBe("Sede de Prueba Unit Test");
    expect(foundVenue.capacity).toBe(10);
  });

  it("should return 404 for non-existent edition", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { ofmiEdition: "999999" },
    });

    await venuesHandler(req, res);

    expect(res.statusCode).toBe(404);
  });
});
