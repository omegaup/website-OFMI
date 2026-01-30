import { MEX, stateNames } from "@/lib/address";
import { Static, Type } from "@sinclair/typebox";

export const VenueSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  address: Type.String(),
  state: Type.String(),
  googleMapsUrl: Type.Union([Type.String(), Type.Null()]),
});

export type Venue = Static<typeof VenueSchema>;

export const AvailableVenuesSchema = Type.Array(VenueSchema);
export type AvailableVenues = Static<typeof AvailableVenuesSchema>;

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
  ofmiId: Type.String(),
  capacity: Type.Integer({ minimum: 1 }),
});

export type CreateVenueQuotaInput = Static<typeof CreateVenueQuotaInputSchema>;

export const CreateVenueQuotaOutputSchema = Type.Object({
  success: Type.Boolean(),
});

export type CreateVenueQuotaOutput = Static<
  typeof CreateVenueQuotaOutputSchema
>;

export type AddVenuesResponse = Static<typeof AddVenuesResponseSchema>;
export const AddVenuesResponseSchema = Type.Object({
  success: Type.Boolean(),
});

export type AddVenuesRequest = Static<typeof AddVenuesRequestSchema>;
export const AddVenuesRequestSchema = Type.Array(
  Type.Object({
    name: Type.String(),
    state: Type.Union(stateNames(MEX).map((s) => Type.Literal(s))),
    address: Type.String(),
    googleMapsUrl: Type.Union([Type.String(), Type.Null()]),
  }),
  {
    description:
      "Registra datos de las sedes. TSV con encabezados: name   state   dirección   mapsUrl",
  },
);
