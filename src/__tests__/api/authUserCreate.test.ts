import { describe, it, expect, beforeEach } from "vitest";
import { verifySession } from "./mocks/session";
import { mockEmailer } from "./mocks/emailer";
import createUserHandler from "@/pages/api/user/create";
import { emailReg } from "@/lib/validators";
import {
  insertAndCheckSuccessfullyDummyInsertion,
  mockRequestResponse,
  removeIfExists,
} from "./authUserCreateUtils";
import { verifyEmail } from "@/lib/emailVerificationToken";

const dummyEmail = "create@test.com";

beforeEach(async () => {
  await removeIfExists(dummyEmail);
  // emailer
  mockEmailer.resetMock();
});

describe("/api/user/create API Endpoint", () => {
  it("successfull insert", async () => {
    await insertAndCheckSuccessfullyDummyInsertion(dummyEmail);
  });

  it("email sent", async () => {
    await insertAndCheckSuccessfullyDummyInsertion(dummyEmail);
    expect(mockEmailer.getSentEmails()).toMatchObject([
      {
        mailOptions: {
          to: dummyEmail,
          subject: "Verifica tu cuenta de la página de la OFMI",
          html: expect.stringContaining("/login?verifyToken="),
        },
      },
    ]);
  });

  it("token verification works", async () => {
    await insertAndCheckSuccessfullyDummyInsertion(dummyEmail);
    const emails = mockEmailer.getSentEmails();
    expect(emails).length(1);
    const html = emails[0].mailOptions.html?.toString();
    if (!html) {
      return expect(html).not.toBeUndefined();
    }
    const matches = Array.from(
      html.matchAll(/<a href=".*\/login\?verifyToken=(.*)">/g),
    );
    expect(matches).length(1);
    const token = matches[0][1];
    // Clear the emailer
    mockEmailer.resetMock();
    const response = await verifyEmail({ token });
    expect(response).toMatchObject({
      success: true,
      email: dummyEmail,
    });
    expect(mockEmailer.getSentEmails()).toMatchObject([
      {
        mailOptions: {
          to: dummyEmail,
          subject: "La página de la OFMI te da la bienvenida",
          html: expect.stringContaining("/registro"),
        },
      },
    ]);
    // Make sure it ingest the cookie session
    expect(await verifySession()).toMatchObject({
      email: dummyEmail,
      role: "user",
    });
  });

  it("try to register with the same email", async () => {
    await insertAndCheckSuccessfullyDummyInsertion(dummyEmail);
    const { req, res } = mockRequestResponse({
      body: {
        email: dummyEmail,
        password: "password",
      },
    });
    await createUserHandler(req, res);

    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message: "Ya existe una cuenta con ese email.",
    });
    expect(res.statusCode).toBe(400);
  });

  it("invalid email", async () => {
    const invalidEmail = "invalid_email.com";
    const { req, res } = mockRequestResponse({
      body: {
        email: invalidEmail,
        password: "password",
      },
    });
    await createUserHandler(req, res);

    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message: `El campo /email no cumple con los requerimientos. Expected string to match '${emailReg}'`,
    });
    expect(res.statusCode).toBe(400);
  });

  it("missing password", async () => {
    const email = "dummy@test.com";
    const { req, res } = mockRequestResponse({
      body: {
        email: email,
      },
    });
    await createUserHandler(req, res);

    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message: "Se esperaba el campo /password",
    });
    expect(res.statusCode).toBe(400);
  });
});
