import { SendEmailRequestSchema } from "@/types/admin.schema";
import { TObject, Type } from "@sinclair/typebox";

export const APIS: {
  [key: string]: ["GET" | "POST", TObject];
} = {
  "/api/admin/sendEmail": ["POST", SendEmailRequestSchema],
  "/api/admin/exportParticipants": ["GET", Type.Object({})],
};
