import { toISOStringReg } from "@/lib/validators/date";
import { Static, Type } from "@sinclair/typebox";

export type GetAvailabilitiesRequest = Static<
  typeof GetAvailabilitiesRequestSchema
>;
export const GetAvailabilitiesRequestSchema = Type.Object({
  ofmiEdition: Type.Number(),
  startTime: Type.String({ pattern: toISOStringReg }),
  endTime: Type.String({ pattern: toISOStringReg }),
});

export type UserAvailability = {
  firstName: string;
  lastName: string;
  calendlySchedulingUrl: string;
  availableStartTimes: Array<string>;
};

export type GetAvailabilitiesResponse = {
  availabilities: Array<UserAvailability>;
};
