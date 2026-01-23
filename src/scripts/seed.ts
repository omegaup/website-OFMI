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

async function insertVenues(): Promise<void> {
  const ofmi = await prisma.ofmi.findUnique({ where: { edition: 4 } });
  if (!ofmi) return;

  const venuesData = [
    {
      name: "Facultad de Ciencias - UNAM",
      address: "Av. Universidad 3000, C.U.",
      state: "CDMX",
      googleMapsUrl: "https://maps.app.goo.gl/RtAqXnvZwnZ8neKk9",
      capacity: 50,
    },
    {
      name: "CUCEI - UDG",
      address: "Blvd. Marcelino García Barragán 1421",
      state: "Jalisco",
      googleMapsUrl: "https://maps.app.goo.gl/z4GR8RRbqyhqVU4f8",
      capacity: 30,
    },
    {
      name: "CIMAT",
      address: "Jalisco S/N, Valenciana",
      state: "Guanajuato",
      googleMapsUrl: "https://maps.app.goo.gl/nRVhXABgrXuSmxXD9",
      capacity: 20,
    },
  ];

  for (const v of venuesData) {
    const venue = await prisma.venue.create({
      data: {
        name: v.name,
        address: v.address,
        state: v.state,
        googleMapsUrl: v.googleMapsUrl,
      },
    });

    await prisma.venueQuota.create({
      data: {
        venueId: venue.id,
        ofmiId: ofmi.id,
        capacity: v.capacity,
      },
    });
  }
}

export async function seed(): Promise<void> {
  await insertUser();
  await insertOFMI();
  await insertVenues();
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
