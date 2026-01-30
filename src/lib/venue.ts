import { prisma } from "@/lib/prisma";
import { AvailableVenues } from "@/types/venue.schema";

export async function findAllVenues(): Promise<AvailableVenues | null> {
  const res = await prisma.venue.findMany();

  return res.map((v) => ({
    id: v.id,
    name: v.name,
    address: v.address,
    state: v.state,
    googleMapsUrl: v.googleMapsUrl,
  }));
}
