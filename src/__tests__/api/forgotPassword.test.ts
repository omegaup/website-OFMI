import { describe, it, expect, beforeEach } from "vitest";
import { mockEmailer } from "./mocks/emailer";
import {
  insertAndCheckSuccessfullyDummyInsertionVerified,
  mockRequestResponse,
  removeIfExists,
} from "./authUserCreateUtils";
import resetPasswordHandler from "@/pages/api/user/resetPassword";
import changePasswordHandler from "@/pages/api/user/changePassword";
import loginUserHandler from "@/pages/api/user/auth";

const dummyEmail = "resetPassword@test.com";

beforeEach(async () => {
  await removeIfExists(dummyEmail);
  // emailer
  mockEmailer.resetMock();
});

describe("Forgot password", () => {
  it("successful password recovery", async () => {
    await insertAndCheckSuccessfullyDummyInsertionVerified(dummyEmail);
    expect(mockEmailer.getSentEmails()).length(2);
    mockEmailer.resetMock();

    // Start by requesting the resetPassword token
    const { req, res } = mockRequestResponse({
      body: {
        email: dummyEmail,
      },
    });
    await resetPasswordHandler(req, res);

    expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res._getJSONData()).toMatchObject({
      message:
        "Si el usuario existe, se le ha enviado un correo con las instrucciones para cambiar su contraseña",
    });
    expect(res.statusCode).toBe(200);

    expect(mockEmailer.getSentEmails()).toMatchObject([
      {
        mailOptions: {
          to: dummyEmail,
          subject: "Recuperación de contraseña de la OFMI",
          html: expect.stringContaining("/changePassword?token="),
        },
      },
    ]);

    const html = mockEmailer.getSentEmails()[0].mailOptions.html?.toString();
    if (!html) {
      return expect(html).not.toBeUndefined();
    }
    const matches = Array.from(
      html.matchAll(/<a href=".*\/changePassword\?token=(.*)">/g),
    );
    expect(matches).length(1);
    const token = matches[0][1];

    // Now call reset password handler
    const newPassword = "newPassword#forgotEmail";
    mockEmailer.resetMock();
    const { req: req2, res: res2 } = mockRequestResponse({
      body: {
        password: newPassword,
        token,
      },
    });
    await changePasswordHandler(req2, res2);
    expect(res2.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res2._getJSONData()).toMatchObject({
      message: "La contraseña fue actualizada exitosamente",
    });
    expect(res2.statusCode).toBe(200);

    expect(mockEmailer.getSentEmails()).toMatchObject([
      {
        mailOptions: {
          to: dummyEmail,
          subject: "Actualización de contraseña de la OFMI",
        },
      },
    ]);

    // login successfully
    const { req: req3, res: res3 } = mockRequestResponse({
      body: {
        email: dummyEmail,
        password: newPassword,
      },
    });
    await loginUserHandler(req3, res3);
    expect(res3.getHeaders()).toEqual({ "content-type": "application/json" });
    expect(res3._getJSONData()).toMatchObject({
      user: {
        email: dummyEmail,
      },
    });
    expect(res3.statusCode).toBe(200);
  });

  describe("/api/user/resetPassword", () => {
    it("user does not exists", async () => {
      const { req, res } = mockRequestResponse({
        body: {
          email: dummyEmail,
        },
      });
      await resetPasswordHandler(req, res);

      expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
      expect(res._getJSONData()).toMatchObject({
        message:
          "Si el usuario existe, se le ha enviado un correo con las instrucciones para cambiar su contraseña",
      });
      expect(res.statusCode).toBe(200);

      expect(mockEmailer.getSentEmails().length).toBe(0);
    });
  });

  describe("/api/user/changePassword", () => {
    it("invalid token", async () => {
      await insertAndCheckSuccessfullyDummyInsertionVerified(dummyEmail);
      mockEmailer.resetMock();
      const { req, res } = mockRequestResponse({
        body: {
          password: "newPassword",
          token: "invalid",
        },
      });
      await changePasswordHandler(req, res);
      expect(res.getHeaders()).toEqual({ "content-type": "application/json" });
      expect(res._getJSONData()).toMatchObject({
        message: "El token es invalido",
      });
      expect(res.statusCode).toBe(400);

      expect(mockEmailer.getSentEmails().length).toBe(0);
    });
  });
});
