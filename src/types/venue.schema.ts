import { Static, Type } from "@sinclair/typebox";

export const VenueSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  address: Type.String(),
  state: Type.String(),
  googleMapsUrl: Type.Union([Type.String(), Type.Null()]),
});

export type Venue = Static<typeof VenueSchema>;

export const VenueQuotaSchema = Type.Object({
  id: Type.String(),
  venueId: Type.String(),
  ofmiId: Type.String(),
  capacity: Type.Integer(),
  occupied: Type.Integer(),
  venue: VenueSchema,
});
export type VenueQuota = Static<typeof VenueQuotaSchema>;

export const CreateVenueInputSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  address: Type.String({ minLength: 1 }),
  state: Type.String({ minLength: 2 }), // "CDMX", "JAL", etc.
  googleMapsUrl: Type.Optional(Type.String()),
});

export type CreateVenueInput = Static<typeof CreateVenueInputSchema>;

export const CreateVenueQuotaInputSchema = Type.Object({
  venueId: Type.String(),
  ofmiEdition: Type.Integer(),
  capacity: Type.Integer({ minimum: 1 }),
});

export type CreateVenueQuotaInput = Static<typeof CreateVenueQuotaInputSchema>;
