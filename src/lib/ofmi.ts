import { prisma } from "@/lib/prisma";
import {
  ParticipationRequestInput,
  ParticipationRequestInputSchema,
  UserParticipation,
} from "@/types/participation.schema";
import { Pronoun, PronounsOfString } from "@/types/pronouns";
import { ShirtStyle, ShirtStyleOfString } from "@/types/shirt";
import { filterNull } from "@/utils";
import { Ofmi, User } from "@prisma/client";
import { Value } from "@sinclair/typebox/value";
import { TTLCache } from "./cache";
import path from "path";

const caches = {
  findMostRecentOfmi: new TTLCache<Ofmi>(),
};

export function friendlyOfmiName(
  ofmiEdition: number,
  formatted = false,
): string {
  return `${ofmiEdition}a${formatted ? " OFMI" : "-ofmi"}`;
}

export const findOfmiByEdition = async (
  edition: number,
): Promise<Ofmi | null> => {
  return prisma.ofmi.findFirst({ where: { edition } });
};

export const findContestantByOfmiAndEmail = async (
  ofmi: Ofmi,
  email: string,
): Promise<User | null> => {
  const contestant = await prisma.userAuth.findFirstOrThrow({
    where: {
      email,
      User: {
        Participation: {
          some: {
            ofmiId: ofmi.id,
            role: "CONTESTANT",
          },
        },
      },
    },
    select: {
      User: true,
    },
  });
  return contestant?.User;
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

  const allDisqualifications = await prisma.disqualification.findMany({
    where: {
      ofmiId: ofmi.id,
    },
    select: {
      userId: true,
      reason: true,
      appealed: true,
    },
  });

  const mappedDisqualifications = new Map<string, string>();

  for (const { appealed, reason, userId: id } of allDisqualifications) {
    mappedDisqualifications.set(id, appealed ? "N/A" : reason);
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
        contestantParticipation && {
          role,
          schoolName: contestantParticipation.School.name,
          schoolStage: contestantParticipation.School.stage,
          schoolGrade: contestantParticipation.schoolGrade,
          schoolCountry: contestantParticipation.School.country,
          schoolState: contestantParticipation.School.state,
          disqualificationReason: mappedDisqualifications.get(user.id) ?? "N/A",
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

  const disqualification = await prisma.disqualification.findUnique({
    where: {
      userId_ofmiId: {
        userId: participation.userId,
        ofmiId: ofmi.id,
      },
    },
  });

  const disqualificationReason =
    !disqualification || disqualification.appealed
      ? "N/A"
      : disqualification.reason;

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
        disqualificationReason,
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
