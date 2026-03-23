import {
  FindOrCreateDriveFolderForParticipantRequestSchema,
  SendEmailRequestSchema,
} from "@/types/admin.schema";
import { TObject, Type } from "@sinclair/typebox";

export const APIS: {
  [key: string]: ["GET" | "POST", TObject];
} = {
  "/api/admin/sendEmail": ["POST", SendEmailRequestSchema],
  "/api/admin/exportParticipants": [
    "GET",
    Type.Object(
      {},
      {
        description: "Exporta a google sheets la lista de participantes",
      },
    ),
  ],
  "/api/admin/exportVenueInfo": [
    "GET",
    Type.Object(
      {},
      {
        description: "Exporta a google sheets la información de las sedes",
      },
    ),
  ],
  "/api/admin/findOrCreateDriveFolderForParticipant": [
    "POST",
    FindOrCreateDriveFolderForParticipantRequestSchema,
  ],
  "/api/admin/volunteers/mentorship": [
    "GET",
    Type.Object(
      {},
      {
        description: "Obtiene el estado de mentorías de todos los voluntarios",
      },
    ),
  ],
  "/api/admin/volunteers/mentorship": [
    "POST",
    Type.Array(
      Type.Object({
        volunteerParticipationId: Type.String(),
        mentorshipEnabled: Type.Boolean(),
      }),
      {
        description: "Actualiza el estado de mentorías de los voluntarios",
      },
    ),
  ],
};
