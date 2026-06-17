import { describe, it, expect, beforeEach } from "vitest";
import { mockEmailer } from "./mocks/emailer";
import {
  removeIfExists,
  insertAndCheckSuccessfullyDummyInsertion,
} from "./authUserCreateUtils";
import resendEmailVerificationTokenHandler from "@/pages/api/user/resendEmailVerification";
import { mockRequestResponse } from "../factories";

const dummyEmail = "emailVerification@test.com";

beforeEach(async () => {
  await removeIfExists(dummyEmail);
  mockEmailer.resetMock();
});

describe("/api/user/resendEmailVerification API Endpoint", () => {
  it("successfully resend email", async () => {
    await insertAndCheckSuccessfullyDummyInsertion(dummyEmail);
    expect(mockEmailer.getSentEmails()).length(1);
    mockEmailer.resetMock();

    const { req, res } = mockRequestResponse({
      body: {
        email: dummyEmail,
        password: "password",
      },
    });
    await resendEmailVerificationTokenHandler(req, res);

    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      email: dummyEmail,
      message:
        "Si hay una cuenta registrada con ese correo, recibirás una liga con el nuevo token.",
    });
    expect(res.statusCode).toBe(200);

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

  it("no account with that email", async () => {
    const { req, res } = mockRequestResponse({
      body: {
        email: dummyEmail,
        password: "password",
      },
    });
    await resendEmailVerificationTokenHandler(req, res);

    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message:
        "No hay una cuenta registrada con ese correo, por favor crea una nueva cuenta.",
    });
    expect(res.statusCode).toBe(400);
  });
});
