import { Type, Static } from "@sinclair/typebox";
import { UserAuth } from "@prisma/client";

export type CreateUserRequest = Static<typeof CreateUserRequestSchema>;
export const CreateUserRequestSchema = Type.Object({
  // Username of user (must be unique)
  email: Type.String({ minLength: 1 }),
  // Password of user
  password: Type.String({ minLength: 1 }),
});

export type CreateUserResponse = {
  user: UserAuth;
};