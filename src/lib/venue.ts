import { prisma } from "@/lib/prisma";
import { UserWithVenueQuota } from "@/types/user.schema";
import { AvailableVenues, VenueQuotas } from "@/types/venue.schema";

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

export async function findAllVenueQuotas(ofmiId: string): Promise<VenueQuotas> {
  return await prisma.venueQuota.findMany({
    where: { ofmiId: ofmiId },
    include: { venue: true },
  });
}

export async function findAllParticipantsInVenueQuotas(
  venueQuotaIds: string[],
): Promise<UserWithVenueQuota[]> {
  const result = await prisma.user.findMany({
    select: {
      firstName: true,
      lastName: true,
      Participation: {
        select: {
          ContestantParticipation: {
            select: {
              venueQuotaId: true,
            },
          },
        },
      },
    },
    where: {
      Participation: {
        some: {
          ContestantParticipation: {
            is: { venueQuotaId: { in: venueQuotaIds } },
          },
        },
      },
    },
  });

  return result.map((p) => {
    const cp =
      p.Participation.length > 0
        ? p.Participation[0].ContestantParticipation
        : null;
    const vqId = cp ? cp.venueQuotaId : null;
    return {
      firstName: p.firstName,
      lastName: p.lastName,
      venueQuotaId: vqId ? vqId : "",
    };
  });
}
