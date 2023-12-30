import { PrismaClient, UserAuth } from '@prisma/client'
const prisma = new PrismaClient()

export { prisma }
export type { UserAuth }
