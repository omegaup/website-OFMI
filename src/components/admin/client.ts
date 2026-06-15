import {
  FindOrCreateDriveFolderForParticipantRequestSchema,
  SendEmailRequestSchema,
} from "@/types/admin.schema";
import { TSchema, Type } from "@sinclair/typebox";
import { UiSchema } from "@rjsf/utils";

type APIConfig = {
  method: "GET" | "POST";
  schema: TSchema;
  uiSchema?: UiSchema;
  transformFormData?: (data: Record<string, unknown>) => unknown;
};

export const APIS: {
  [key: string]: APIConfig;
} = {
  "/api/admin/sendEmail": {
    method: "POST",
    schema: SendEmailRequestSchema,
  },
  "/api/admin/exportParticipants": {
    method: "GET",
    schema: Type.Object(
      {},
      {
        description: "Exporta a google sheets la lista de participantes",
      },
    ),
  },
  "/api/admin/exportVenueInfo": {
    method: "GET",
    schema: Type.Object(
      {},
      {
        description: "Exporta a google sheets la información de las sedes",
      },
    ),
  },
  "/api/admin/deleteContestantParticipation": {
    method: "POST",
    schema: Type.Object(
      {
        emails: Type.String({
          title: "Correos electrónicos",
          description: "Un correo por línea",
        }),
        ofmiEdition: Type.Optional(Type.Integer({ minimum: 1 })),
      },
      {
        description:
          "Marca participantes concursantes como eliminados y libera sus sedes. Si no se especifica la edición de la OFMI, se usará la más reciente.",
      },
    ),
    uiSchema: {
      emails: { "ui:widget": "textarea", "ui:options": { rows: 5 } },
    },
    transformFormData: (data) => ({
      ...data,
      emails: (data.emails as string)
        .split("\n")
        .map((e) => e.trim())
        .filter(Boolean),
    }),
  },
  "/api/admin/findOrCreateDriveFolderForParticipant": {
    method: "POST",
    schema: FindOrCreateDriveFolderForParticipantRequestSchema,
  },
  "/api/admin/volunteers/mentorship": {
    method: "POST",
    schema: Type.Object(
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
  },
};
