import { hashPassword } from "@/lib/hashPassword";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function insertRoles(): Promise<void> {
  const roles = ["CONTESTANT", "MENTOR", "PROBLEMSETTER"];
  roles.forEach(async (role) => {
    await prisma.participationRole.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  });
}

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
          first_name: "Admin",
          last_name: "OFMI",
          birth_date: "2015-09-30T07:06:21.5663224Z",
          government_id: "CURP",
          preferred_name: "admin",
          pronouns: "they/them",
          shirt_size: "M",
          shirt_style: "idk",
          mailing_address: {
            create: {
              street: "Sesame Street",
              external_number: "123",
              internal_number: "A",
              zip_code: "123123",
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
  await insertRoles();
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
