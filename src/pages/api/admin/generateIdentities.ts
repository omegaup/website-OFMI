import { prisma } from "@/lib/prisma";
import { friendlyOfmiName } from "@/lib/ofmi";
import { NextApiRequest, NextApiResponse } from "next";
import countries from "@/lib/address/iso-3166-countries.json";
import { capitalizeInitials, getMexStateCode } from "@/utils";
import { Value } from "@sinclair/typebox/value";
import { parseValueError } from "@/lib/typebox";
import { GenerateIdentitiesRequestInputSchema } from "@/types/participation.schema";
import { Prisma } from "@prisma/client";

export type Participation = Prisma.ParticipationGetPayload<{
  include: {
    user: true;
    ContestantParticipation: {
      include: {
        School: true;
      };
    };
  };
}>;

export function generateIdentities(onlyContestants: Participation[]): {
  [key: string]: string;
}[] {
  const states = new Map<string, number>();

  const getMaxContestantsCount = (
    contestants: typeof onlyContestants,
  ): number => {
    let maxi = 0;
    const states = new Map<string, number>();
    // Mexican contestants are divided by their state
    // International contestants are divided by their country
    // Among all these different groups, find the one with the greatest amount of participants.
    // This is done to make sure participant username's length is equal.
    for (const contestant of contestants) {
      const { School: school } = contestant.ContestantParticipation!;
      let state = school.country;
      if (state === "Mexico") {
        state = school.state;
      }
      const count = (states.get(state) || 0) + 1;
      maxi = Math.max(maxi, count);
      states.set(state, count);
    }
    return maxi;
  };

  const minDigits = Math.log10(getMaxContestantsCount(onlyContestants));

  const generateUsername = (state: string): string => {
    const rawNumber = (states.get(state) || 0) + 1;
    const strNumber = rawNumber.toString();
    const number = "0".repeat(minDigits - strNumber.length + 1) + strNumber;
    states.set(state, rawNumber);
    return `${state}-${number}`;
  };

  return onlyContestants.map((contestant) => {
    const { user, ContestantParticipation } = contestant;
    const school = ContestantParticipation!.School;
    const country = countries.find((country) => {
      return country.name === school.country;
    }) || {
      name: "International",
      "alpha-3": "INT",
      "country-code": "0",
    };
    const baseUser = {
      name: capitalizeInitials(`${user.firstName} ${user.lastName}`),
      school_name: school.name,
      country_id: country["alpha-3"],
      gender: "decline",
    };
    const { country_id } = baseUser;
    if (country_id === "MEX") {
      const state = getMexStateCode(school.state);
      return {
        ...baseUser,
        state_id: state,
        username: generateUsername(state),
      };
    }
    return {
      ...baseUser,
      state_id: country_id,
      username: generateUsername(country_id),
    };
  });
}

export async function generateIdentitiesHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { body } = req;

  if (!Value.Check(GenerateIdentitiesRequestInputSchema, body)) {
    const firstError = Value.Errors(
      GenerateIdentitiesRequestInputSchema,
      body,
    ).First();
    return res.status(400).json({
      message: `${firstError ? parseValueError(firstError) : "Invalid request body."}`,
    });
  }

  const { ofmiEdition } = body;

  const ofmi = await prisma.ofmi.findUnique({
    where: {
      edition: ofmiEdition,
    },
  });

  if (!ofmi) {
    return res.status(404).json({
      message: `No se encontro ${friendlyOfmiName(ofmiEdition)}`,
    });
  }

  const onlyContestants = await prisma.participation.findMany({
    where: {
      ofmiId: ofmi.id,
      ContestantParticipation: {
        disqualified: false,
      },
    },
    include: {
      user: true,
      ContestantParticipation: {
        include: {
          School: true,
        },
      },
    },
  });

  const identities = generateIdentities(onlyContestants);

  const rows = ["username,name,country_id,state_id,gender,school_name"];

  for (const participant of identities) {
    rows.push(
      `${participant.username},${participant.name},${participant.country_id},${participant.state_id},${participant.gender},${participant.school_name}`,
    );
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${friendlyOfmiName(ofmi.edition)}-identities.csv"`,
  );

  return res.status(201).send(rows.join("\n"));
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method == "GET") {
    await generateIdentitiesHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
