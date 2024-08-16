import { Type, Static } from "@sinclair/typebox";
import { UserAuth } from "@prisma/client";
import { emailReg } from "@/lib/validators";

export type CreateUserRequest = Static<typeof CreateUserRequestSchema>;
export const CreateUserRequestSchema = Type.Object({
  // Username of user (must be unique)
  email: Type.String({ pattern: emailReg }),
  // Password of user
  password: Type.String({ minLength: 1 }),
});

export interface CreateUserResponse {
  user: UserAuth;
}

export type LoginUserRequest = Static<typeof LoginUserRequestSchema>;
export const LoginUserRequestSchema = Type.Object({
  // Username of user (must be unique)
  email: Type.String({ pattern: emailReg }),
  // Password of user
  password: Type.String({ minLength: 1 }),
});

export interface LoginUserResponse {
  user: UserAuth;
}

export type VerifyEmailRequest = Static<typeof VerifyEmailRequestSchema>;
export const VerifyEmailRequestSchema = Type.Object({
  // email
  email: Type.String({ pattern: emailReg }),
});

export interface VerifyEmailResponse {
  email: string;
  message: string;
}
