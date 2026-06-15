import config from "@/config/default";
import { getOrCreateDriveFolder } from "./gcloud";
import path from "path";
import { prisma } from "@/lib/prisma";
import { friendlyOfmiName, findMostRecentOfmi } from "./ofmi";
import { ofmiUserAuthId } from "./ofmiUserImpersonator";

export async function findOrCreateDriveFolderForParticipant({
  email,
  ofmiEdition,
}: {
  email: string;
  ofmiEdition: number;
}): Promise<string> {
  const userAuthId = await ofmiUserAuthId();
  return await getOrCreateDriveFolder({
    dir: path.join(
      friendlyOfmiName(ofmiEdition),
      "Assets",
      "Participants",
      email,
    ),
    userAuthId,
    rootFolderId: config.GDRIVE_OFMI_ROOT_FOLDER,
  });
}

export async function deleteContestantParticipation({
  email,
  ofmiEdition,
}: {
  email: string;
  ofmiEdition?: number;
}): Promise<Date> {
  const ofmi =
    ofmiEdition !== undefined
      ? await prisma.ofmi.findUnique({ where: { edition: ofmiEdition } })
      : await findMostRecentOfmi();

  if (!ofmi) {
    throw new Error("No se encontró la edición de la OFMI.");
  }

  const participation = await prisma.participation.findFirst({
    where: {
      ofmiId: ofmi.id,
      role: "CONTESTANT",
      user: { UserAuth: { email } },
    },
    include: {
      ContestantParticipation: true,
    },
  });

  if (!participation || !participation.ContestantParticipation) {
    throw new Error("No se encontró la participación de concurso para el correo proporcionado.");
  }

  const contestantParticipation = participation.ContestantParticipation;

  if (contestantParticipation.deletedAt) {
    throw new Error("El participante ya fue marcado como eliminado.");
  }

  const deletedAt = new Date();
  await prisma.$transaction(async (tx) => {
    if (contestantParticipation.venueQuotaId) {
      await tx.venueQuota.update({
        where: { id: contestantParticipation.venueQuotaId },
        data: { occupied: { decrement: 1 } },
      });
    }

    await tx.contestantParticipation.update({
      where: { id: contestantParticipation.id },
      data: {
        deletedAt,
        venueQuotaId: null,
      },
    });
  });

  return deletedAt;
}
