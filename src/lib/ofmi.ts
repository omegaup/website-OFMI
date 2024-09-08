import { prisma } from "@/lib/prisma";
import {
  ParticipationRequestInput,
  ParticipationRequestInputSchema,
  UserParticipation,
} from "@/types/participation.schema";
import { Pronoun, PronounsOfString } from "@/types/pronouns";
import { ShirtStyle, ShirtStyleOfString } from "@/types/shirt";
import { filterNull } from "@/utils";
import { Ofmi } from "@prisma/client";
import { Value } from "@sinclair/typebox/value";

export async function findMostRecentOfmi(): Promise<Ofmi> {
  const ofmi = await prisma.ofmi.findFirst({
    orderBy: { edition: "desc" },
  });
  if (!ofmi) {
    throw Error("Most recent OFMI not found.");
  }
  return ofmi;
}

export async function findParticipants(
  ofmi: Ofmi,
): Promise<Array<ParticipationRequestInput>> {
  const participants = await prisma.participation.findMany({
    where: { ofmiId: ofmi.id },
    include: {
      user: {
        include: {
          MailingAddress: true,
          UserAuth: {
            select: { email: true },
          },
        },
      },
      ContestantParticipation: {
        include: {
          School: true,
        },
      },
      VolunteerParticipation: true,
    },
  });

  const res = participants.map((participation) => {
    // TODO: Share code with findParticipation
    const {
      user,
      role,
      ContestantParticipation: contestantParticipation,
      VolunteerParticipation: volunteerParticipation,
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
      (role === "VOLUNTEER" &&
        volunteerParticipation && {
          role,
          ...volunteerParticipation,
        }) ||
      null;

    if (!userParticipation) {
      return null;
    }

    const payload: ParticipationRequestInput = {
      ofmiEdition: ofmi.edition,
      user: {
        ...user,
        email: user.UserAuth.email,
        birthDate: user.birthDate.toISOString(),
        pronouns: PronounsOfString(user.pronouns) as Pronoun,
        shirtStyle: ShirtStyleOfString(user.shirtStyle) as ShirtStyle,
        mailingAddress: {
          ...mailingAddress,
          recipient: mailingAddress.name,
          internalNumber: mailingAddress.internalNumber ?? undefined,
          municipality: mailingAddress.county,
          locality: mailingAddress.neighborhood,
          references: mailingAddress.references ?? undefined,
        },
      },
      userParticipation: userParticipation as UserParticipation,
    };

    return Value.Cast(ParticipationRequestInputSchema, payload);
  });

  return filterNull(res);
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
          UserAuth: {
            select: { email: true },
          },
        },
      },
      ContestantParticipation: {
        include: {
          School: true,
        },
      },
      VolunteerParticipation: true,
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
    VolunteerParticipation: volunteerParticipation,
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
    (role === "VOLUNTEER" &&
      volunteerParticipation && {
        role,
        ...volunteerParticipation,
      }) ||
    null;

  if (!userParticipation) {
    return null;
  }

  const payload: ParticipationRequestInput = {
    ofmiEdition: ofmi.edition,
    user: {
      ...user,
      email: user.UserAuth.email,
      birthDate: user.birthDate.toISOString(),
      pronouns: PronounsOfString(user.pronouns) as Pronoun,
      shirtStyle: ShirtStyleOfString(user.shirtStyle) as ShirtStyle,
      mailingAddress: {
        ...mailingAddress,
        recipient: mailingAddress.name,
        internalNumber: mailingAddress.internalNumber ?? undefined,
        municipality: mailingAddress.county,
        locality: mailingAddress.neighborhood,
        references: mailingAddress.references ?? undefined,
      },
    },
    userParticipation: userParticipation as UserParticipation,
  };

  return Value.Cast(ParticipationRequestInputSchema, payload);
}
