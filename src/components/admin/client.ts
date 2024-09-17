import {
  SendEmailRequestSchema,
  SendEmailResponseSchema,
} from "@/types/admin.schema";
import { UpsertParticipationRequestSchema } from "@/types/participation.schema";
import { TObject } from "@sinclair/typebox";

export const APIS: {
  [key: string]: [TObject, TObject];
} = {
  "/api/admin/sendEmail": [SendEmailRequestSchema, SendEmailResponseSchema],
  "/api/ofmi/upsertParticipation": [
    UpsertParticipationRequestSchema,
    SendEmailResponseSchema,
  ],
};
