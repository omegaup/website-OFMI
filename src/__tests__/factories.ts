import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hashPassword";
import {
  ParticipationRole,
  SchoolStage,
  ShirtSize,
  Role,
  Ofmi,
  UserAuth,
  MailingAddress,
  User,
  School,
  Venue,
  VenueQuota,
  ContestantParticipation,
  VolunteerParticipation,
  Participation,
} from "@prisma/client";
import {
  createMocks,
  RequestMethod,
  createRequest,
  createResponse,
} from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type ApiResponse = NextApiResponse & ReturnType<typeof createResponse>;

// ---------------------------------------------------------------------------
// Mock request/response helper
// ---------------------------------------------------------------------------

export function mockRequestResponse({
  method = "POST" as RequestMethod,
  body,
  headers,
  query,
}: {
  method?: RequestMethod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  headers?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query?: any;
}): {
  req: ApiRequest;
  res: ApiResponse;
} {
  const { req, res } = createMocks<ApiRequest, ApiResponse>({
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body,
    query,
  });
  return { req, res };
}

// ---------------------------------------------------------------------------
// Default data constants
// ---------------------------------------------------------------------------

export const DEFAULTS = {
  mailingAddress: {
    street: "Calle",
    externalNumber: "#8Bis",
    zipcode: "01234",
    country: "MEX",
    state: "Aguascalientes",
    references: "Por ahí",
    phone: "5511223344",
    county: "Aguascalientes",
    neighborhood: "Aguascalientes",
    name: "Test User",
  },
  user: {
    firstName: "Test",
    lastName: "User",
    preferredName: "Testy",
    birthDate: new Date("2006-11-24"),
    pronouns: "HE",
    governmentId: "HEGG061124MVZRRL02",
    shirtSize: ShirtSize.M,
    shirtStyle: "STRAIGHT",
  },
  school: {
    name: "Test School",
    stage: SchoolStage.HIGH as SchoolStage,
    state: "CDMX",
    country: "MX",
  },
  venue: {
    name: "Test Venue",
    address: "Test Address",
    state: "CDMX",
  },
};

// ---------------------------------------------------------------------------
// Cleanup tracker - collects IDs for cleanup in reverse-dependency order
// ---------------------------------------------------------------------------

export class TestCleanup {
  private participationIds: string[] = [];
  private contestantParticipationIds: string[] = [];
  private volunteerParticipationIds: string[] = [];
  private userIds: string[] = [];
  private userAuthIds: string[] = [];
  private mailingAddressIds: string[] = [];
  private schoolIds: string[] = [];
  private venueQuotaIds: string[] = [];
  private venueIds: string[] = [];
  private ofmiIds: string[] = [];

  trackParticipation(id: string): void {
    this.participationIds.push(id);
  }
  trackContestantParticipation(id: string): void {
    this.contestantParticipationIds.push(id);
  }
  trackVolunteerParticipation(id: string): void {
    this.volunteerParticipationIds.push(id);
  }
  trackUser(id: string): void {
    this.userIds.push(id);
  }
  trackUserAuth(id: string): void {
    this.userAuthIds.push(id);
  }
  trackMailingAddress(id: string): void {
    this.mailingAddressIds.push(id);
  }
  trackSchool(id: string): void {
    this.schoolIds.push(id);
  }
  trackVenueQuota(id: string): void {
    this.venueQuotaIds.push(id);
  }
  trackVenue(id: string): void {
    this.venueIds.push(id);
  }
  trackOfmi(id: string): void {
    this.ofmiIds.push(id);
  }

  async run(): Promise<void> {
    const allUserAuthIds = this.userAuthIds;
    if (allUserAuthIds.length) {
      const users = await prisma.user.findMany({
        where: { userAuthId: { in: allUserAuthIds } },
        select: { id: true, mailingAddressId: true },
      });
      for (const u of users) {
        if (!this.userIds.includes(u.id)) this.userIds.push(u.id);
        if (
          u.mailingAddressId &&
          !this.mailingAddressIds.includes(u.mailingAddressId)
        )
          this.mailingAddressIds.push(u.mailingAddressId);
      }
    }

    if (this.userIds.length) {
      const participations = await prisma.participation.findMany({
        where: { userId: { in: this.userIds } },
        select: {
          id: true,
          contestantParticipationId: true,
          volunteerParticipationId: true,
        },
      });
      for (const p of participations) {
        if (!this.participationIds.includes(p.id))
          this.participationIds.push(p.id);
        if (
          p.contestantParticipationId &&
          !this.contestantParticipationIds.includes(p.contestantParticipationId)
        )
          this.contestantParticipationIds.push(p.contestantParticipationId);
        if (
          p.volunteerParticipationId &&
          !this.volunteerParticipationIds.includes(p.volunteerParticipationId)
        )
          this.volunteerParticipationIds.push(p.volunteerParticipationId);
      }
    }

    if (this.participationIds.length)
      await prisma.participation.deleteMany({
        where: { id: { in: this.participationIds } },
      });
    if (this.contestantParticipationIds.length)
      await prisma.contestantParticipation.deleteMany({
        where: { id: { in: this.contestantParticipationIds } },
      });
    if (this.volunteerParticipationIds.length)
      await prisma.volunteerParticipation.deleteMany({
        where: { id: { in: this.volunteerParticipationIds } },
      });
    if (this.userIds.length)
      await prisma.user.deleteMany({
        where: { id: { in: this.userIds } },
      });
    if (allUserAuthIds.length)
      await prisma.userAuth.deleteMany({
        where: { id: { in: allUserAuthIds } },
      });
    if (this.mailingAddressIds.length)
      await prisma.mailingAddress.deleteMany({
        where: { id: { in: this.mailingAddressIds } },
      });
    if (this.schoolIds.length)
      await prisma.school.deleteMany({
        where: { id: { in: this.schoolIds } },
      });
    if (this.venueQuotaIds.length)
      await prisma.venueQuota.deleteMany({
        where: { id: { in: this.venueQuotaIds } },
      });
    if (this.venueIds.length)
      await prisma.venue.deleteMany({
        where: { id: { in: this.venueIds } },
      });
    if (this.ofmiIds.length)
      await prisma.ofmi.deleteMany({
        where: { id: { in: this.ofmiIds } },
      });
  }
}

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

export async function createOfmi(
  cleanup: TestCleanup,
  overrides: Partial<{
    edition: number;
    year: number;
    registrationOpenTime: Date;
    registrationCloseTime: Date;
    birthDateRequirement: Date;
  }> = {},
): Promise<Ofmi> {
  const edition =
    overrides.edition ?? Math.floor(Math.random() * 900000) + 10000;
  const data = {
    edition,
    year: overrides.year ?? 2030,
    registrationOpenTime:
      overrides.registrationOpenTime ?? new Date("2024-01-01"),
    registrationCloseTime:
      overrides.registrationCloseTime ?? new Date("2050-12-31"),
    birthDateRequirement: overrides.birthDateRequirement,
  };
  const ofmi = await prisma.ofmi.upsert({
    where: { edition },
    update: data,
    create: data,
  });
  cleanup.trackOfmi(ofmi.id);
  return ofmi;
}

export async function createUserAuth(
  cleanup: TestCleanup,
  overrides: Partial<{ email: string; password: string; role: Role }> = {},
): Promise<UserAuth> {
  const email =
    overrides.email ??
    `test+${Date.now()}+${Math.random().toString(36).slice(2)}@test.com`;
  const userAuth = await prisma.userAuth.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashPassword(overrides.password ?? "password"),
      role: overrides.role,
    },
  });
  cleanup.trackUserAuth(userAuth.id);
  return userAuth;
}

export async function createMailingAddress(
  cleanup: TestCleanup,
  overrides: Partial<typeof DEFAULTS.mailingAddress> = {},
): Promise<MailingAddress> {
  const address = await prisma.mailingAddress.create({
    data: { ...DEFAULTS.mailingAddress, ...overrides },
  });
  cleanup.trackMailingAddress(address.id);
  return address;
}

export async function createUser(
  cleanup: TestCleanup,
  opts: {
    userAuthId: string;
    mailingAddressId?: string;
    overrides?: Partial<typeof DEFAULTS.user & { mailingAddressId: string }>;
  },
): Promise<User> {
  let mailingAddressId = opts.mailingAddressId;
  if (!mailingAddressId) {
    const address = await createMailingAddress(cleanup);
    mailingAddressId = address.id;
  }
  const user = await prisma.user.create({
    data: {
      ...DEFAULTS.user,
      ...opts.overrides,
      userAuthId: opts.userAuthId,
      mailingAddressId,
    },
  });
  cleanup.trackUser(user.id);
  return user;
}

export async function createSchool(
  cleanup: TestCleanup,
  overrides: Partial<typeof DEFAULTS.school> = {},
): Promise<School> {
  const data = { ...DEFAULTS.school, ...overrides };
  const school = await prisma.school.upsert({
    where: {
      name_stage_state_country: {
        name: data.name,
        stage: data.stage,
        state: data.state,
        country: data.country,
      },
    },
    update: {},
    create: data,
  });
  cleanup.trackSchool(school.id);
  return school;
}

export async function createVenue(
  cleanup: TestCleanup,
  overrides: Partial<typeof DEFAULTS.venue> = {},
): Promise<Venue> {
  const venue = await prisma.venue.create({
    data: { ...DEFAULTS.venue, ...overrides },
  });
  cleanup.trackVenue(venue.id);
  return venue;
}

export async function createVenueQuota(
  cleanup: TestCleanup,
  opts: {
    venueId: string;
    ofmiId: string;
    capacity?: number;
    occupied?: number;
  },
): Promise<VenueQuota> {
  const vq = await prisma.venueQuota.create({
    data: {
      venueId: opts.venueId,
      ofmiId: opts.ofmiId,
      capacity: opts.capacity ?? 50,
      occupied: opts.occupied ?? 0,
    },
  });
  cleanup.trackVenueQuota(vq.id);
  return vq;
}

export async function createContestantParticipation(
  cleanup: TestCleanup,
  opts: {
    schoolId: string;
    schoolGrade?: number;
    venueQuotaId?: string | null;
  },
): Promise<ContestantParticipation> {
  const cp = await prisma.contestantParticipation.create({
    data: {
      schoolId: opts.schoolId,
      schoolGrade: opts.schoolGrade ?? 1,
      disqualified: false,
      venueQuotaId: opts.venueQuotaId ?? null,
    },
  });
  cleanup.trackContestantParticipation(cp.id);
  return cp;
}

export async function createVolunteerParticipation(
  cleanup: TestCleanup,
  overrides: Partial<{
    mentorOptIn: boolean;
    mentorshipEnabled: boolean;
  }> = {},
): Promise<VolunteerParticipation> {
  const vp = await prisma.volunteerParticipation.create({
    data: {
      educationalLinkageOptIn: false,
      fundraisingOptIn: false,
      communityOptIn: false,
      trainerOptIn: false,
      problemSetterOptIn: false,
      mentorOptIn: overrides.mentorOptIn ?? false,
      mentorshipEnabled: overrides.mentorshipEnabled ?? false,
    },
  });
  cleanup.trackVolunteerParticipation(vp.id);
  return vp;
}

export async function createParticipation(
  cleanup: TestCleanup,
  opts: {
    userId: string;
    ofmiId: string;
    role?: ParticipationRole;
    contestantParticipationId?: string;
    volunteerParticipationId?: string;
  },
): Promise<Participation> {
  const p = await prisma.participation.create({
    data: {
      userId: opts.userId,
      ofmiId: opts.ofmiId,
      role: opts.role ?? ParticipationRole.CONTESTANT,
      contestantParticipationId: opts.contestantParticipationId,
      volunteerParticipationId: opts.volunteerParticipationId,
    },
  });
  cleanup.trackParticipation(p.id);
  return p;
}

// ---------------------------------------------------------------------------
// Composite factory: creates a full contestant with all dependencies
// ---------------------------------------------------------------------------

export async function createFullContestant(
  cleanup: TestCleanup,
  opts: {
    email?: string;
    ofmiId: string;
    venueQuotaId?: string | null;
    userOverrides?: Partial<typeof DEFAULTS.user>;
    schoolOverrides?: Partial<typeof DEFAULTS.school>;
  },
): Promise<{
  userAuth: UserAuth;
  user: User;
  school: School;
  contestantParticipation: ContestantParticipation;
  participation: Participation;
}> {
  const userAuth = await createUserAuth(cleanup, { email: opts.email });
  const user = await createUser(cleanup, {
    userAuthId: userAuth.id,
    overrides: opts.userOverrides,
  });
  const school = await createSchool(cleanup, opts.schoolOverrides);
  const cp = await createContestantParticipation(cleanup, {
    schoolId: school.id,
    venueQuotaId: opts.venueQuotaId,
  });
  const participation = await createParticipation(cleanup, {
    userId: user.id,
    ofmiId: opts.ofmiId,
    role: ParticipationRole.CONTESTANT,
    contestantParticipationId: cp.id,
  });

  return { userAuth, user, school, contestantParticipation: cp, participation };
}
