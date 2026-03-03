import { OauthProvider } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";

export type DisconnectOauthProviderRequest = Static<
  typeof DisconnectOauthProviderRequestSchema
>;
export const DisconnectOauthProviderRequestSchema = Type.Object({
  // Username of user (must be unique)
  userAuthId: Type.String(),
  // Password of user
  provider: Type.Enum(OauthProvider),
});

export type CalendlyWebhookSubscriptionRequestSchema = Static<
  typeof CalendlyWebhookSubscriptionRequestSchema
>;

export const CalendlyWebhookSubscriptionRequestSchema = Type.Object({
  uri: Type.String(),
  callback_url: Type.String(),
  created_at: Type.String(),
  updated_at: Type.String(),
  retry_started_at: Type.String(),
  state: Type.String(),
  events: Type.Array(Type.String()),
  scope: Type.String(),
  organization: Type.String(),
  user: Type.String(),
  group: Type.String(),
  creator: Type.String(),
});
