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
