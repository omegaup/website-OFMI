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

export const VenueQuotasSchema = Type.Array(VenueQuotaSchema);
export type VenueQuotas = Static<typeof VenueQuotasSchema>;

export const CreateVenueQuotaRequestSchema = Type.Object({
  venueId: Type.String(),
  ofmiId: Type.String(),
  capacity: Type.Integer({ minimum: 1 }),
});

export type CreateVenueQuotaInput = Static<
  typeof CreateVenueQuotaRequestSchema
>;

export const CreateVenueQuotaResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

export type CreateVenueQuotaOutput = Static<
  typeof CreateVenueQuotaResponseSchema
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
