import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { BadRequestError } from "@/types/errors";

async function findOfmi(editionParam?: string | string[]) {
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

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<any | BadRequestError>,
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

    const venueQuotas = await prisma.venueQuota.findMany({
      where: { ofmiId: ofmi.id },
      include: { venue: true },
    });

    const venues = venueQuotas.map((vq) => ({
      id: vq.id,
      venueId: vq.venueId,
      name: vq.venue.name,
      address: vq.venue.address,
      state: vq.venue.state,
      googleMapsUrl: vq.venue.googleMapsUrl,
      capacity: vq.capacity,
      occupied: vq.occupied,
      available: vq.capacity - vq.occupied,
    }));

    return res.status(200).json({ venues });
  } catch (error) {
    console.error("Error fetching venues:", error);
    return res.status(500).json({ message: "Error interno al obtener sedes" });
  }
}
