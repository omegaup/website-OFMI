import { prisma } from "@/lib/prisma";
import {
  ContestantParticipationRole,
  ParticipationRequestInput,
} from "@/types/participation.schema";
import { Pronoun, PronounsOfString } from "@/types/pronouns";
import {
  ShirtSize,
  ShirtSizeOfString,
  ShirtStyle,
  ShirtStyleOfString,
} from "@/types/shirt";
import { Ofmi } from "@prisma/client";

export async function findMostRecentOfmi(): Promise<Ofmi | null> {
  return await prisma.ofmi.findFirst({
    orderBy: { edition: "desc" },
  });
}

export async function findParticipation(
  ofmi: Ofmi,
  email: string,
): Promise<ParticipationRequestInput | null> {
  const participation = await prisma.participation.findFirst({
    include: {
      user: {
        include: {
          mailing_address: true,
        },
      },
      contestant_participation: {
        include: {
          school: true,
        },
      },
      role: true,
    },
    where: { ofmi_id: ofmi.id, user: { UserAuth: { email: email } } },
  });

  if (!participation) {
    return null;
  }

  const { user, contestant_participation } = participation;
  const { mailing_address } = user;

  if (!contestant_participation) {
    // TODO: Remove this once we can register others than contestants
    return null;
  }

  // TODO: Maybe if we call this fields exactly as in DB
  // we can reduce this.
  return {
    ofmiEdition: ofmi.edition,
    country: participation.country,
    state: participation.state,
    user: {
      email: email,
      firstName: user.first_name,
      lastName: user.last_name,
      preferredName: user.preferred_name,
      birthDate: user.birth_date.toISOString(),
      governmentId: user.government_id,
      pronouns: PronounsOfString(user.pronouns) as Pronoun,
      shirtSize: ShirtSizeOfString(user.shirt_size) as ShirtSize,
      shirtStyle: ShirtStyleOfString(user.shirt_style) as ShirtStyle,
      mailingAddress: {
        recipient: mailing_address.name,
        street: mailing_address.street,
        externalNumber: mailing_address.external_number,
        internalNumber: mailing_address.internal_number ?? undefined,
        state: mailing_address.state,
        zipcode: mailing_address.zip_code,
        country: mailing_address.country,
        municipality: mailing_address.county,
        locality: mailing_address.neighborhood,
        references: mailing_address.references ?? undefined,
        phone: mailing_address.phone,
      },
    },
    userParticipation: {
      role: participation.role.name as ContestantParticipationRole,
      schoolName: contestant_participation.school.name,
      schoolStage: contestant_participation.school.stage,
      schoolGrade: contestant_participation.school_grade,
    },
  };
}
