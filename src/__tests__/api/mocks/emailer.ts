import {
  newUserEmailTemplate,
  signUpSuccessfulEmailTemplate,
} from "@/lib/emailer/template";
import type { MailOptions } from "nodemailer/lib/json-transport";
import { vi } from "vitest";

type sentEmails = { mailOptions: MailOptions }[];

class MockEmailer {
  private sentEmails: sentEmails = [];

  public async sendEmail(mailOptions: MailOptions): Promise<void> {
    await this.sentEmails.push({ mailOptions });
  }

  public async notifyUserForSignup(email: string, url: string): Promise<void> {
    await this.sendEmail(newUserEmailTemplate(email, url));
  }

  public async notifyUserSuccessfulSignup(email: string): Promise<void> {
    await this.sendEmail(signUpSuccessfulEmailTemplate(email));
  }

  public getSentEmails(): sentEmails {
    return this.sentEmails;
  }

  public resetMock(): void {
    this.sentEmails = [];
  }
}

export const mockEmailer = new MockEmailer();

// Mock the module
vi.mock("@/lib/emailer", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/emailer")>();
  return {
    ...mod,
    Emailer: MockEmailer,
    emailer: mockEmailer,
  };
});
