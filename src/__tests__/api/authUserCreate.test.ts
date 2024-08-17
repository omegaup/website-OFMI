import { describe, it, expect, beforeEach } from "vitest";
import { mockEmailer } from "./mocks/emailer";
import createUserHandler from "@/pages/api/user/create";
import { emailReg } from "@/lib/validators";
import {
  insertAndCheckSuccessfullyDummyInsertion,
  mockRequestResponse,
  removeIfExists,
} from "./authUserCreateUtils";

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
