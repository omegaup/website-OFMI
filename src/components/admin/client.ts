import { SendEmailRequestSchema } from "@/types/admin.schema";
import { TObject } from "@sinclair/typebox";

export const APIS: {
  [key: string]: TObject;
} = {
  "/api/admin/sendEmail": SendEmailRequestSchema,
};
