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

export type UserAvailability = Static<typeof UserAvailabilitySchema>;
export const UserAvailabilitySchema = Type.Object({
  firstName: Type.String(),
  lastName: Type.String(),
  calendlySchedulingUrl: Type.String(),
  availableStartTimes: Type.Array(Type.String()),
});

export type GetAvailabilitiesResponse = Static<
  typeof GetAvailabilitiesResponseSchema
>;
export const GetAvailabilitiesResponseSchema = Type.Object({
  availabilities: Type.Array(UserAvailabilitySchema),
});
