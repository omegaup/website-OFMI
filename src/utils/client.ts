import { PrismaClient } from '@prisma/client'

import client from '../config/default'

const { isProduction } = client

declare global {
  const prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

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
