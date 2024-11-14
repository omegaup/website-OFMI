import { prisma } from "@/lib/prisma";
import {
  ParticipationRequestInput,
  ParticipationRequestInputSchema,
  UserParticipation,
  UserParticipationSchema,
} from "@/types/participation.schema";
import { Pronoun, PronounsOfString } from "@/types/pronouns";
import { ShirtStyle, ShirtStyleOfString } from "@/types/shirt";
import { filterNull } from "@/utils";
import { Ofmi } from "@prisma/client";
import { Value } from "@sinclair/typebox/value";
import { TTLCache } from "./cache";
import path from "path";

const caches = {
  findMostRecentOfmi: new TTLCache<Ofmi>(),
};

export function friendlyOfmiName(
  ofmiEdition: number,
  humanReadable = false,
): string {
  return `${ofmiEdition}a${humanReadable ? " OFMI" : "-ofmi"}`;
}

export const findOfmiByEdition = async (
  edition: number,
): Promise<Ofmi | null> => {
  return prisma.ofmi.findFirst({ where: { edition } });
};

export function registrationSpreadsheetsPath(ofmiEdition: number): string {
  return path.join(
    friendlyOfmiName(ofmiEdition),
    `Registro ${friendlyOfmiName(ofmiEdition)} (Respuestas)`,
  );
}

export async function findMostRecentOfmi(): Promise<Ofmi> {
  // Check if the cache has the result
  const ttlCache = caches["findMostRecentOfmi"];
  const cacheKey = "findMostRecentOfmi";
  const cacheValue = ttlCache.get(cacheKey);
  if (cacheValue) {
    return cacheValue;
  }

  const ofmi = await prisma.ofmi.findFirst({
    orderBy: { edition: "desc" },
  });
  if (!ofmi) {
    throw Error("Most recent OFMI not found.");
  }

  ttlCache.set(cacheKey, ofmi);
  return ofmi;
}

export async function findParticipants(
  ofmi: Ofmi,
): Promise<Array<ParticipationRequestInput>> {
  const participants = await prisma.participation.findMany({
    where: { ofmiId: ofmi.id, volunteerParticipationId: null },
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
          Disqualification: {
            select: {
              appealed: true,
              reason: true,
              id: true,
            },
          },
        },
      },
      VolunteerParticipation: true,
    },
  });

  const mappedDisqualifications = new Map<string, string>();

  for (const participant of participants) {
    let reason = "N/A";
    const participation = participant.ContestantParticipation!;
    const disqualification = participation.Disqualification;
    if (disqualification && !disqualification.appealed) {
      reason = disqualification.reason;
    }
    mappedDisqualifications.set(participant.id, reason);
  }

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
        contestantParticipation &&
        Value.Cast(UserParticipationSchema, {
          role,
          schoolName: contestantParticipation.School.name,
          schoolStage: contestantParticipation.School.stage,
          schoolGrade: contestantParticipation.schoolGrade,
          schoolCountry: contestantParticipation.School.country,
          schoolState: contestantParticipation.School.state,
          disqualificationReason: mappedDisqualifications.get(user.id),
        })) ||
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
      registeredAt: participation.createdAt.toISOString(),
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
    where: { ofmiId: ofmi.id, user: { UserAuth: { email: email } } },
    include: {
      user: {
        select: {
          id: true,
        },
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
    registeredAt: participation.createdAt.toISOString(),
    userParticipation: userParticipation as UserParticipation,
  };

  return Value.Cast(ParticipationRequestInputSchema, payload);
}
