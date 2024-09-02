import { prisma } from "@/lib/prisma";
import {
  ParticipationRequestInput,
  UserParticipation,
} from "@/types/participation.schema";
import { Pronoun, PronounsOfString } from "@/types/pronouns";
import { ShirtStyle, ShirtStyleOfString } from "@/types/shirt";
import { Ofmi } from "@prisma/client";

export async function findMostRecentOfmi(): Promise<Ofmi | null> {
  const ofmi = await prisma.ofmi.findFirst({
    orderBy: { edition: "desc" },
  });
  if (!ofmi) {
    console.error("Most recent OFMI not found.");
  }
  return ofmi;
}

export async function findParticipation(
  ofmi: Ofmi,
  email: string,
): Promise<ParticipationRequestInput | null> {
  const participation = await prisma.participation.findFirst({
    include: {
      user: {
        include: {
          MailingAddress: true,
        },
      },
      ContestantParticipation: {
        include: {
          School: true,
        },
      },
      MentorParticipation: true,
    },
    where: { ofmiId: ofmi.id, user: { UserAuth: { email: email } } },
  });

  if (!participation) {
    return null;
  }

  const {
    user,
    role,
    ContestantParticipation: contestantParticipation,
    MentorParticipation: mentorParticipation,
  } = participation;
  const { MailingAddress: mailingAddress } = user;

  const userParticipation: UserParticipation | null =
    (role === "CONTESTANT" &&
      contestantParticipation && {
        role,
        schoolName: contestantParticipation.School.name,
        schoolStage: contestantParticipation.School.stage,
        schoolGrade: contestantParticipation.schoolGrade,
        schoolCountry: contestantParticipation.School.country,
        schoolState: contestantParticipation.School.state,
      }) ||
    (role === "MENTOR" &&
      mentorParticipation && {
        role,
      }) ||
    null;

  if (!userParticipation) {
    return null;
  }

  return {
    ofmiEdition: ofmi.edition,
    user: {
      email: email,
      firstName: user.firstName,
      lastName: user.lastName,
      preferredName: user.preferredName,
      birthDate: user.birthDate.toISOString(),
      governmentId: user.governmentId,
      pronouns: PronounsOfString(user.pronouns) as Pronoun,
      shirtSize: user.shirtSize,
      shirtStyle: ShirtStyleOfString(user.shirtStyle) as ShirtStyle,
      mailingAddress: {
        recipient: mailingAddress.name,
        street: mailingAddress.street,
        externalNumber: mailingAddress.externalNumber,
        internalNumber: mailingAddress.internalNumber ?? undefined,
        state: mailingAddress.state,
        zipcode: mailingAddress.zipcode,
        country: mailingAddress.country,
        municipality: mailingAddress.county,
        locality: mailingAddress.neighborhood,
        references: mailingAddress.references ?? undefined,
        phone: mailingAddress.phone,
      },
    },
    userParticipation: userParticipation as UserParticipation,
  };
}
