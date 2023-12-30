import { PrismaClient } from '@prisma/client'

import client from '../config/default'

const { isProduction } = client

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton> // eslint-disable-line no-var
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect()
    console.log('🚀 ~ database connected.')
  } catch (error: any) {
    console.log(
      '🚀 ~ file: client.ts:14 ~ connectDatabase ~ error:',
      isProduction ? error.message : error.stack
    )
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('🚀 ~ database disconnected.')
  }
}

export default connectDatabase
