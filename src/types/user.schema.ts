import { Type, Static } from '@sinclair/typebox'

export type UserAuth = Static<typeof UserAuthSchema>
export const UserAuthSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  password: Type.String(),
  role: Type.Union([Type.Literal('ADMIN'), Type.Literal('USER')]),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  emailVerified: Type.String()
})
