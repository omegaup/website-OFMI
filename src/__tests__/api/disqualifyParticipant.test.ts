import { mockEmailer } from "./mocks/emailer";
import {
  createMocks,
  RequestMethod,
  createRequest,
  createResponse,
} from "node-mocks-http";
import createParticipantDisqualificationHandler from "@/pages/api/admin/disqualifyParticipant";
import updateParticipantDisqualificationHandler from "@/pages/api/admin/disqualifyParticipant";
import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "@/lib/hashPassword";
import { prisma } from "@/lib/prisma";
import { ShirtSize } from "@prisma/client";
import { friendlyOfmiName } from "@/lib/ofmi";

const dummyEmail = "disqualifyParticipant@test.com";

const today = new Date(Date.now());

const generateOfmi = (
  edition: number,
  year: number,
): {
  edition: number;
  year: number;
  birthDateRequirement: Date;
  registrationOpenTime: Date;
  registrationCloseTime: Date;
} => {
  return {
    edition,
    year,
    birthDateRequirement: new Date(`${year - 18}-07-01`),
    registrationOpenTime: new Date(`${year}-07-07`),
    registrationCloseTime: new Date(`${year}-08-08`),
  };
};

const validRequest = {
  ofmiEdition: today.getFullYear() - 2021,
  email: dummyEmail,
  sendEmail: true,
  reason: "IA",
  appealed: false,
};

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

let user: {
    id: string;
    userAuthId: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    governmentId: string;
    preferredName: string;
    pronouns: string;
    shirtSize: ShirtSize;
    shirtStyle: string;
    mailingAddressId: string;
    createdAt: Date;
    updatedAt: Date;
  },
  ofmi: {
    id: string;
    edition: number;
    year: number;
    registrationOpenTime: Date;
    registrationCloseTime: Date;
    birthDateRequirement: Date | null;
    highSchoolGraduationDateLimit: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };

beforeAll(async () => {
  ofmi = await prisma.ofmi.upsert({
    where: { edition: validRequest.ofmiEdition },
    update: {
      ...generateOfmi(validRequest.ofmiEdition, today.getFullYear()),
    },
    create: {
      ...generateOfmi(validRequest.ofmiEdition, today.getFullYear()),
    },
  });

  const userAuth = await prisma.userAuth.upsert({
    where: { email: dummyEmail },
    update: {},
    create: { email: dummyEmail, password: hashPassword("pass") },
  });

  const maildingAddress = {
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
  };

  const userData = {
    firstName: "Juan Carlos",
    lastName: "Sigler Priego",
    birthDate: new Date("2006-11-24").toISOString(),
    governmentId: "HEGG061124MVZRRL02",
    preferredName: "Juanito",
    pronouns: "HE",
    shirtSize: "M" as ShirtSize,
    shirtStyle: "STRAIGHT",
  };

  user = await prisma.user.upsert({
    where: { userAuthId: userAuth.id },
    create: {
      UserAuth: {
        connect: {
          id: userAuth.id,
        },
      },
      MailingAddress: {
        create: maildingAddress,
      },
      ...userData,
    },
    update: {
      MailingAddress: {
        update: maildingAddress,
      },
      ...userData,
    },
  });
});

beforeEach(async () => {
  await prisma.contestantParticipation.deleteMany({
    where: {
      Participation: { every: { user: { UserAuth: { email: dummyEmail } } } },
    },
  });
  await prisma.participation.deleteMany({
    where: { user: { UserAuth: { email: dummyEmail } } },
  });
  await prisma.disqualification.deleteMany({
    where: {
      ContestantParticipation: {
        Participation: { every: { user: { UserAuth: { email: dummyEmail } } } },
      },
    },
  });
  mockEmailer.resetMock();
});

describe("/api/admin/disqualifyParticipant API Endpoint", () => {
  function mockRequestResponse({
    method = "POST",
    body,
  }: {
    method?: RequestMethod;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any;
  }): {
    req: ApiRequest;
    res: APiResponse;
  } {
    const { req, res } = createMocks<ApiRequest, APiResponse>({
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    return { req, res };
  }

  it("should disqualify", async () => {
    const { req, res } = mockRequestResponse({ body: validRequest });

    const participation = await prisma.participation.create({
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

    await createParticipantDisqualificationHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });

    const disqualificationModel = await prisma.disqualification.findFirst({
      where: {
        ContestantParticipation: {
          id: participation.contestantParticipationId!,
        },
      },
    });

    expect(disqualificationModel).not.toBeNull();
  });

  it("should not disqualify non-contestant", async () => {
    const { req, res } = mockRequestResponse({ body: validRequest });

    await createParticipantDisqualificationHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });

    const disqualificationModel = await prisma.disqualification.findMany({
      where: {
        ContestantParticipation: {
          Participation: {
            every: {
              userId: user.id,
              ofmiId: ofmi.id,
            },
          },
        },
      },
    });

    expect(disqualificationModel.length).toBe(0);
  });

  it("should not disqualify already disqualified participant", async () => {
    const { req, res } = mockRequestResponse({ body: validRequest });

    const participation = await prisma.participation.create({
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

    const disqualification = await prisma.disqualification.create({
      data: {
        reason: validRequest.reason,
        appealed: validRequest.appealed,
        ContestantParticipation: {
          connect: { id: participation.contestantParticipationId! },
        },
      },
    });

    await createParticipantDisqualificationHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });

    const linkedDisqualification =
      await prisma.contestantParticipation.findUnique({
        where: {
          id: participation.contestantParticipationId!,
        },
        select: {
          DisqualificationId: true,
        },
      });

    expect(linkedDisqualification).not.toBeNull();
    expect(linkedDisqualification!.DisqualificationId).toBe(
      disqualification.id,
    );
  });

  it("should update disqualification", async () => {
    const { req, res } = mockRequestResponse({
      method: "PUT",
      body: { ...validRequest, appealed: true },
    });

    const { contestantParticipationId } = await prisma.participation.create({
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

    const disqualification = await prisma.disqualification.create({
      data: {
        reason: validRequest.reason,
        appealed: validRequest.appealed,
        ContestantParticipation: {
          connect: { id: contestantParticipationId! },
        },
      },
      select: {
        id: true,
      },
    });

    await updateParticipantDisqualificationHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.getHeaders()).toEqual({
      "content-type": "application/json",
    });

    const updatedDisqualification = await prisma.disqualification.findUnique({
      where: { id: disqualification.id },
      select: {
        appealed: true,
      },
    });

    expect(updatedDisqualification).not.toBeNull();
    expect(updatedDisqualification!.appealed).toBe(true);
  });

  it("should not update non-existent disqualification", async () => {
    const { req, res } = mockRequestResponse({
      method: "PUT",
      body: { ...validRequest, appealed: true },
    });

    await updateParticipantDisqualificationHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.getHeaders()).toEqual({
      "content-type": "application/json",
    });

    const updatedDisqualification = await prisma.disqualification.findMany({
      where: {
        ContestantParticipation: {
          Participation: { every: { userId: user.id, ofmiId: ofmi.id } },
        },
      },
    });

    expect(updatedDisqualification.length).toBe(0);
  });

  it("should send email when sendEmail is true", async () => {
    const { req, res } = mockRequestResponse({ body: validRequest });

    await prisma.participation.create({
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

    await createParticipantDisqualificationHandler(req, res);
    expect(mockEmailer.getSentEmails()).toMatchObject([
      {
        mailOptions: {
          to: dummyEmail,
          subject: `Descalificación de la ${friendlyOfmiName(validRequest.ofmiEdition, true)}`,
        },
      },
    ]);
  });

  it("should not send email when sendEmail is false", async () => {
    const { req, res } = mockRequestResponse({
      body: { ...validRequest, appealed: true, sendEmail: false },
    });

    const { contestantParticipationId } = await prisma.participation.create({
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

    await prisma.disqualification.create({
      data: {
        reason: validRequest.reason,
        appealed: validRequest.appealed,
        ContestantParticipation: {
          connect: { id: contestantParticipationId! },
        },
      },
      select: {
        id: true,
      },
    });

    await updateParticipantDisqualificationHandler(req, res);
    expect(mockEmailer.getSentEmails()).toMatchObject([]);
  });
});
