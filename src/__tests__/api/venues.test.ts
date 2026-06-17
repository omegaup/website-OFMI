import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMocks } from "node-mocks-http";
import venuesHandler from "@/pages/api/ofmi/venues";
import { VenueQuota } from "@/types/venue.schema";
import {
  TestCleanup,
  createOfmi,
  createVenue,
  createVenueQuota,
} from "../factories";

describe("/api/ofmi/venues API Endpoint", () => {
  const cleanup = new TestCleanup();
  let testOfmiEdition: number;
  let venueId: string;

  beforeAll(async () => {
    const ofmi = await createOfmi(cleanup, { edition: 77701 });
    testOfmiEdition = ofmi.edition;

    const venue = await createVenue(cleanup, {
      name: "Sede de Prueba Unit Test",
    });
    venueId = venue.id;

    await createVenueQuota(cleanup, {
      venueId: venue.id,
      ofmiId: ofmi.id,
      capacity: 10,
    });
  });

  afterAll(() => cleanup.run());

  it("should return venues for specific edition", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { ofmiEdition: testOfmiEdition.toString() },
    });

    await venuesHandler(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();

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
