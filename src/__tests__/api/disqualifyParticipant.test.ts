import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { hashPassword } from "@/lib/hashPassword";
import { prisma } from "@/lib/prisma";

const dummyEmail = "disqualifyParticipant@test.com";

const validOfmi = {
  edition: 1,
  birthDateRequirement: new Date("2005-07-01"),
  year: 2024,
  registrationOpenTime: new Date("2024-07-07"),
  registrationCloseTime: new Date("2050-08-08"),
};

let ofmi,
  participation: {
    id: string;
    contestantParticipationId: string | null;
  } | null;

beforeAll(async () => {
  ofmi = await prisma.ofmi.upsert({
    where: { edition: validOfmi.edition },
    update: {
      ...validOfmi,
    },
    create: {
      ...validOfmi,
    },
  });

  const userAuth = await prisma.userAuth.upsert({
    where: { email: dummyEmail },
    update: {},
    create: { email: dummyEmail, password: hashPassword("pass") },
  });

  const user = await prisma.user.create({
    data: {
      UserAuth: {
        connect: {
          id: userAuth.id,
        },
      },
      MailingAddress: {
        create: {
          street: "Calle",
          externalNumber: "#8Bis",
          zipcode: "01234",
          country: "MEX",
          state: "Aguascalientes",
          neighborhood: "Aguascalientes",
          county: "Aguascalientes",
          phone: "5511223344",
          references: "Hasta el fondo",
          name: "Juan Carlos",
        },
      },
      firstName: "Juan Carlos",
      lastName: "Sigler Priego",
      birthDate: new Date("2006-11-24").toISOString(),
      governmentId: "HEGG061124MVZRRL02",
      preferredName: "Juanito",
      pronouns: "HE",
      shirtSize: "M",
      shirtStyle: "STRAIGHT",
    },
  });

  participation = await prisma.participation.create({
    data: {
      role: "CONTESTANT",
      user: {
        connect: {
          id: user.id,
        },
      },
      ofmi: {
        connect: {
          id: ofmi.id,
        },
      },
      ContestantParticipation: {
        create: {
          schoolGrade: 3,
          School: {
            connectOrCreate: {
              where: {
                name_stage_state_country: {
                  name: "Colegio Carol Baur",
                  stage: "HIGH",
                  state: "Aguascalientes",
                  country: "MEX",
                },
              },
              create: {
                name: "Colegio Carol Baur",
                stage: "HIGH",
                state: "Aguascalientes",
                country: "MEX",
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      contestantParticipationId: true,
    },
  });
});

beforeEach(async () => {
  const disqualification = await prisma.contestantParticipation.update({
    where: {
      id: participation!.contestantParticipationId!,
    },
    data: {
      Disqualification: {
        disconnect: true,
      },
    },
    select: {
      DisqualificationId: true,
    },
  });

  await prisma.disqualification.delete({
    where: { id: disqualification.DisqualificationId ?? "" },
  });
});
