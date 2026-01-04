import { prisma } from "@/lib/prisma";
import { Ofmi } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { BadRequestError } from "@/types/errors";
import { VenueQuotaSchema } from "@/types/venue.schema";
import { Static } from "@sinclair/typebox";

async function findOfmi(
  editionParam?: string | string[],
): Promise<Ofmi | null> {
  const editionStr = Array.isArray(editionParam)
    ? editionParam[0]
    : editionParam;

  if (editionStr) {
    const edition = parseInt(editionStr);
    if (isNaN(edition)) return null;
    return prisma.ofmi.findUnique({ where: { edition } });
  }

  return prisma.ofmi.findFirst({ orderBy: { edition: "desc" } });
}

type VenueQuota = Static<typeof VenueQuotaSchema>;

type VenueResponse = {
  venues: VenueQuota[];
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<VenueResponse | BadRequestError>,
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not allowed" });
  }

  try {
    const ofmi = await findOfmi(req.query.ofmiEdition);

    if (!ofmi) {
      const message = req.query.ofmiEdition
        ? "Edición OFMI no encontrada"
        : "No hay ediciones OFMI activas";
      return res.status(404).json({ message });
    }

    const venueQuotasRaw = await prisma.venueQuota.findMany({
      where: { ofmiId: ofmi.id },
      include: { venue: true },
    });

    const venues: VenueQuota[] = venueQuotasRaw.map((vq) => ({
      id: vq.id,
      venueId: vq.venueId,
      ofmiId: vq.ofmiId,
      capacity: vq.capacity,
      venue: {
        id: vq.venue.id,
        name: vq.venue.name,
        address: vq.venue.address,
        state: vq.venue.state,
        googleMapsUrl: vq.venue.googleMapsUrl,
      },
    }));

    return res.status(200).json({ venues });
  } catch (error) {
    console.error("Error fetching venues:", error);
    return res.status(500).json({ message: "Error interno al obtener sedes" });
  }
}
