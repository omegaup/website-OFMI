import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.user.upsert({
    where: { email: "ofmi@omegaup.com" },
    update: {},
    create: {
      email: "ofmi@omegaup.com",
      password: "password",
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
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
