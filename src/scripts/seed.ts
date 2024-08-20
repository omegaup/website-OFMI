import { hashPassword } from "@/lib/hashPassword";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function insertOFMI(): Promise<void> {
  await prisma.ofmi.upsert({
    where: { id: undefined, edition: 1 },
    update: {},
    create: {
      edition: 1,
      year: 2024,
      registrationOpenTime: new Date(Date.now()),
      registrationCloseTime: new Date("2050-08-08"),
    },
  });
}

async function insertUser(): Promise<void> {
  await prisma.userAuth.upsert({
    where: { id: undefined, email: "ofmi@omegaup.com" },
    update: {},
    create: {
      email: "ofmi@omegaup.com",
      password: hashPassword("password"),
      emailVerified: new Date(Date.now()),
      User: {
        create: {
          firstName: "Admin",
          lastName: "OFMI",
          birthDate: "2015-09-30T07:06:21.5663224Z",
          governmentId: "CURP",
          preferredName: "admin",
          pronouns: "they/them",
          shirtSize: "M",
          shirtStyle: "idk",
          MailingAddress: {
            create: {
              street: "Sesame Street",
              externalNumber: "123",
              internalNumber: "A",
              zipcode: "123123",
              neighborhood: "idk",
              county: "somewhere",
              state: "MX-MEX",
              country: "MX",
              name: "OFMI Mail Name",
              phone: "123-123-1234",
            },
          },
        },
      },
    },
  });
}

export async function seed(): Promise<void> {
  await insertOFMI();
  await insertUser();
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
