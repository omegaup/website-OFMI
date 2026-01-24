import { prisma } from "@/lib/prisma";
import { Value } from "@sinclair/typebox/value";

import { UserOutput, UserOutputSchema } from "@/types/user.schema";
import { Pronoun, PronounsOfString } from "@/types/pronouns";
import { ShirtStyle, ShirtStyleOfString } from "@/types/shirt";

export async function findUser(email: string): Promise<UserOutput | null> {
  const user = await prisma.user.findFirst({
    where: { UserAuth: { email: email } },
    include: {
      MailingAddress: true,
      UserAuth: {
        select: { email: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  const { MailingAddress: mailingAddress } = user;

  const payload: UserOutput = {
    input: {
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
  };

  return Value.Cast(UserOutputSchema, payload);
}

export async function findUserVenueId(
  email?: string,
  edition?: number,
): Promise<string | null> {
  if (!email || !edition) return null;

  const venue = await prisma.participation.findFirst({
    where: {
      user: { UserAuth: { email } },
      ofmi: { edition },
    },
    select: {
      ContestantParticipation: {
        select: { venueQuotaId: true },
      },
    },
  });

  if (!venue || !venue.ContestantParticipation?.venueQuotaId) return null;
  return venue.ContestantParticipation?.venueQuotaId;
}
