import { Type, Static } from "@sinclair/typebox";
import { Role } from "@prisma/client";
import { emailReg } from "@/lib/validators";

export type UserAuthResponse = Static<typeof UserAuthResponseSchema>;
export const UserAuthResponseSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  email: Type.String({ pattern: emailReg }),
  role: Type.Enum(Role),
});

export type CreateUserRequest = Static<typeof CreateUserRequestSchema>;
export const CreateUserRequestSchema = Type.Object({
  // Username of user (must be unique)
  email: Type.String({ pattern: emailReg }),
  // Password of user
  password: Type.String({ minLength: 1 }),
});

export type CreateUserResponse = Static<typeof CreateUserResponseSchema>;
export const CreateUserResponseSchema = Type.Object({
  user: UserAuthResponseSchema,
});

export type LoginUserRequest = Static<typeof LoginUserRequestSchema>;
export const LoginUserRequestSchema = Type.Object({
  // Username of user (must be unique)
  email: Type.String({ pattern: emailReg }),
  // Password of user
  password: Type.String({ minLength: 1 }),
});

export type LoginUserResponse = Static<typeof LoginUserResponseSchema>;
export const LoginUserResponseSchema = Type.Object({
  user: UserAuthResponseSchema,
});

export type ResendEmailVerificationRequest = Static<
  typeof ResendEmailVerificationRequestSchema
>;
export const ResendEmailVerificationRequestSchema = Type.Object({
  // email
  email: Type.String({ pattern: emailReg }),
});

export type ResendEmailVerificationResponse = {
  email: string;
  message: string;
};

export type PasswordResetRequest = Static<typeof PasswordResetRequestSchema>;
export const PasswordResetRequestSchema = Type.Object({
  email: Type.String({ pattern: emailReg }),
});

export type PasswordChangeRequest = Static<typeof PasswordChangeRequestSchema>;
export const PasswordChangeRequestSchema = Type.Object({
  password: Type.String({ minLength: 8 }),
  passwordConfirm: Type.String({ minLength: 8 }),
  token: Type.String(),
});
