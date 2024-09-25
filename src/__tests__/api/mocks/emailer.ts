import type { MailOptions } from "nodemailer/lib/json-transport";
import { vi } from "vitest";
import { BaseEmailer } from "@/lib/emailer/baseEmailer";

type sentEmails = { mailOptions: MailOptions }[];

class MockEmailer extends BaseEmailer {
  private sentEmails: sentEmails = [];

  public async sendEmail(mailOptions: MailOptions): Promise<void> {
    await this.sentEmails.push({ mailOptions });
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
