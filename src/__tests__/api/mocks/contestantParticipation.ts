import { prisma } from "@/lib/prisma";
import postalCodesJson from "@/lib/address/postal_codes.json";
import {
  generateCURP,
  generateString,
  generatePhoneNumber,
  generateRandomDateBetween,
  getRandomIndex,
  shuffleArray,
  generatePassword,
} from "@/utils";
import { Ofmi, ShirtSize } from "@prisma/client";
import { hashPassword } from "@/lib/hashPassword";
import { ShirtStyles } from "@/types/shirt";
import { Address } from "@/lib/address/types";

class MockContestantParticipations {
  private ofmi: Ofmi;
  private testName: string;

  constructor(testName: string, ofmi: Ofmi) {
    this.ofmi = ofmi;
    this.testName = testName;
    this.ofmi.birthDateRequirement ??= new Date(
      Date.now() - 20 * 365 * 24 * 60 * 60 * 1000,
    );
  }

  private get emailDomain() {
    return `${this.testName}.test.com`;
  }

  public async createMockParticipation(
    firstName: string,
    lastName: string,
    birthDate: Date,
    zipcode: string,
    neighborhood: string,
    county: string,
    state: string,
    school: string,
  ) {
    console.log(`First: ${firstName}`);
    console.log(`Last: ${lastName}`);
    const firstNames = firstName.split(" ");
    const lastNames = lastName.split(" ");
    await prisma.participation.create({
      data: {
        role: "CONTESTANT",
        ofmi: {
          connect: {
            id: this.ofmi.id,
          },
        },
        user: {
          create: {
            firstName,
            lastName,
            birthDate,
            pronouns: "SHE",
            governmentId: generateCURP(
              firstName,
              lastName,
              birthDate,
              state,
              "M",
            ),
            preferredName: firstNames[0],
            MailingAddress: {
              create: {
                zipcode,
                state,
                neighborhood,
                county,
                country: "Mexico",
                phone: generatePhoneNumber(),
                name: `${firstName} ${lastName}`,
                street: `Calle #${getRandomIndex(500)}`,
                externalNumber: `${getRandomIndex(10)}`,
              },
            },
            UserAuth: {
              create: {
                email: `${[...firstNames, ...lastNames].join(".").toLowerCase()}@${this.emailDomain}`,
                password: hashPassword(generatePassword()),
              },
            },
            shirtSize: Object.values(ShirtSize)[getRandomIndex(6)],
            shirtStyle: ShirtStyles[getRandomIndex(2)],
          },
        },
        ContestantParticipation: {
          create: {
            disqualified: false,
            schoolGrade: 1,
            School: {
              create: {
                state,
                name: school,
                stage: "HIGH",
                country: "Mexico",
              },
            },
          },
        },
      },
    });
  }

  public async getAllMockParticipations() {
    return await prisma.participation.findMany({
      where: {
        user: { UserAuth: { email: `@${this.emailDomain}` } },
        ofmiId: this.ofmi.id,
      },
      include: {
        user: true,
        ContestantParticipation: {
          include: {
            School: true,
          },
        },
      },
    });
  }

  public async getRandomMockParticipations(num: number) {
    const participations = await this.getAllMockParticipations();
    shuffleArray(participations);
    return participations.slice(0, num);
  }

  public async createMockParticipations(num: number) {
    const postalCodes = postalCodesJson as Address[];
    for (let i = 0; i < num - 1; i++) {
      const address = postalCodes[i];
      await this.createMockParticipation(
        `${generateString(5)} ${generateString(7)}`,
        `${generateString(4)} ${generateString(8)}`,
        generateRandomDateBetween(
          this.ofmi.birthDateRequirement!,
          this.ofmi.registrationOpenTime,
        ),
        address.postalCode,
        address.neighborhood,
        address.county,
        address.state,
        generateString(32),
      );
    }
    await this.createMockParticipation(
      `${generateString(5)} ${generateString(7)}`,
      `${generateString(4)} ${generateString(8)}`,
      generateRandomDateBetween(
        this.ofmi.birthDateRequirement!,
        this.ofmi.registrationOpenTime,
      ),
      postalCodes[num - 1].postalCode,
      postalCodes[num - 1].neighborhood,
      postalCodes[num - 1].county,
      postalCodes[num - 1].state,
      generateString(32),
    );
  }

  public async clearMockParticipations() {
    await prisma.contestantParticipation.deleteMany({
      where: {
        Participation: {
          every: {
            user: {
              UserAuth: { email: { endsWith: `@${this.emailDomain}` } },
            },
          },
        },
      },
    });
    await prisma.school.deleteMany({
      where: {
        ContestantParticipation: {
          every: {
            Participation: {
              every: {
                user: {
                  UserAuth: {
                    email: { endsWith: `@${this.emailDomain}` },
                  },
                },
              },
            },
          },
        },
      },
    });
    await prisma.participation.deleteMany({
      where: {
        user: {
          UserAuth: { email: { endsWith: `@${this.emailDomain}` } },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        UserAuth: { email: { endsWith: `@${this.emailDomain}` } },
      },
    });
    await prisma.mailingAddress.deleteMany({
      where: {
        User: {
          every: {
            UserAuth: { email: { endsWith: `@${this.emailDomain}` } },
          },
        },
      },
    });
    await prisma.userAuth.deleteMany({
      where: {
        email: { endsWith: `@${this.emailDomain}` },
      },
    });
  }
}

export default MockContestantParticipations;
