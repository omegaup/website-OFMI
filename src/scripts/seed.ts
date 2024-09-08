import config from "@/config/default";
import { hashPassword } from "@/lib/hashPassword";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function insertOFMI(): Promise<void> {
  await prisma.ofmi.upsert({
    where: { edition: 4 },
    update: {},
    create: {
      edition: 4,
      year: 2024,
      registrationOpenTime: new Date("2024-09-08"),
      registrationCloseTime: new Date("2024-10-19"),
      birthDateRequirement: new Date("2005-07-01"),
      highSchoolGraduationDateLimit: new Date("2025-04-01"),
    },
  });
}

async function insertUser(): Promise<void> {
  await prisma.userAuth.upsert({
    where: { email: config.OFMI_USER_EMAIL },
    update: {},
    create: {
      email: config.OFMI_USER_EMAIL,
      password: hashPassword("password"),
      role: "ADMIN",
      emailVerified: new Date(Date.now()),
    },
  });
}

export async function seed(): Promise<void> {
  await insertUser();
  await insertOFMI();
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
