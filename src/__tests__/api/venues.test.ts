import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMocks } from "node-mocks-http";
import venuesHandler from "@/pages/api/ofmi/venues";
import { prisma } from "@/lib/prisma";

describe("/api/ofmi/venues API Endpoint", () => {
  const testOfmiEdition = 5;
  let ofmiId: string;
  let venueId: string;

  beforeAll(async () => {
    const ofmi = await prisma.ofmi.upsert({
      where: { edition: testOfmiEdition },
      update: {},
      create: {
        edition: testOfmiEdition,
        year: 2026,
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
    await prisma.ofmi.delete({ where: { id: ofmiId } });
  });

  it("should return venues for specific edition", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { ofmiEdition: testOfmiEdition.toString() },
    });

    await venuesHandler(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.venues).toHaveLength(1);
    expect(data.venues[0].venue.name).toBe("Sede de Prueba Unit Test");
    expect(data.venues[0].capacity).toBe(10);
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
