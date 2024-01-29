import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("🚀 ~ database connected.");
  } catch (error) {
    console.log("🚀 ~ file: client.ts ~ connectDatabase ~ error:");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🚀 ~ database disconnected.");
  }
};

export default connectDatabase;
