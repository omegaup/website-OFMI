import {
  DeleteContestantParticipationRequestSchema,
  FindOrCreateDriveFolderForParticipantRequestSchema,
  SendEmailRequestSchema,
} from "@/types/admin.schema";
import { TSchema, Type } from "@sinclair/typebox";

export const APIS: {
  [key: string]: ["GET" | "POST", TSchema];
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
  "/api/admin/deleteContestantParticipation": [
    "POST",
    Type.Intersect([
      DeleteContestantParticipationRequestSchema,
      Type.Object(
        {},
        {
          description:
            "Marca un participante concursante como eliminado y libera su sede. Si no se especifica la edición de la OFMI, se usará la participación de concurso más reciente.",
        },
      ),
    ]),
  ],
  "/api/admin/findOrCreateDriveFolderForParticipant": [
    "POST",
    FindOrCreateDriveFolderForParticipantRequestSchema,
  ],
  "/api/admin/volunteers/mentorship": [
    "POST",
    Type.Object(
      {
        updates: Type.Array(
          Type.Object({
            volunteerParticipationId: Type.String(),
            mentorshipEnabled: Type.Boolean(),
          }),
        ),
      },
      { description: "Actualiza el estado de mentorías de los voluntarios" },
    ),
  ],
};
