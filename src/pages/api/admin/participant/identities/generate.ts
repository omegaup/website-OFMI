import { findMostRecentOfmi, findParticipants } from "@/lib/ofmi";
import { VolunteerParticipationInputSchema } from "@/types/participation.schema";
import { Value } from "@sinclair/typebox/build/cjs/value";
import { NextApiRequest, NextApiResponse } from "next";
import countries from "@/lib/address/iso-3166-countries.json";
import { capitalizeInitials, filterNull, getMexStateCode } from "@/utils";

async function generateIdentitiesHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const ofmi = await findMostRecentOfmi();
  const allParticipants = await findParticipants(ofmi);
  const onlyContestants = filterNull(
    allParticipants.map((participant) => {
      if (
        Value.Check(
          VolunteerParticipationInputSchema,
          participant.userParticipation,
        )
      ) {
        return null;
      }
      return {
        ofmiEdition: participant.ofmiEdition,
        user: participant.user,
        userParticipation: participant.userParticipation,
      };
    }),
  );

  const states = new Map<string, number>();

  const getMaxContestantsCount = (
    contestants: typeof onlyContestants,
  ): number => {
    let maxi = 0;
    const states = new Map<string, number>();
    // Mexican contestants are divided by their state
    // International contestants are divided by their country
    // Among all these different groups, find the one with the greatest amount of participants.
    // This is done to make sure participant usernames are as short as possible.
    for (const contestant of contestants) {
      let state = contestant.userParticipation.schoolCountry;
      if (state === "Mexico") {
        state = contestant.userParticipation.schoolState;
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
    const number = "0".repeat(minDigits - strNumber.length) + strNumber;
    states.set(state, rawNumber);
    return `${state}-${number}`;
  };

  onlyContestants.map((contestant) => {
    const { user, userParticipation } = contestant;
    const participation = userParticipation;
    const country = countries.find((country) => {
      return country.name === participation.schoolCountry;
    }) || {
      name: "International",
      "alpha-3": "INT",
      "country-code": "0",
    };
    const baseUser = {
      name: capitalizeInitials(`${user.firstName} ${user.lastName}`),
      school_name: participation.schoolName,
      country_id: country["alpha-3"],
      gender: "decline",
    };
    const { country_id } = baseUser;
    if (country_id === "MEX") {
      const state = getMexStateCode(participation.schoolState);
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
  return res
    .status(201)
    .json({ message: "Las identidades han sido generadas exitosamente" });
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
