import * as nodemailer from "nodemailer";
import type { MailOptions } from "nodemailer/lib/json-transport";
import { OFMI_EMAIL_SMTP_USER_KEY } from "./template";
import config from "@/config/default";
import { getSecretOrError } from "../secret";
import { BaseEmailer } from "./baseEmailer";

const OFMI_EMAIL_SMTP_PASSWORD_KEY = "OFMI_EMAIL_SMTP_PASSWORD";

export class Emailer extends BaseEmailer {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: getSecretOrError(OFMI_EMAIL_SMTP_USER_KEY),
        pass: getSecretOrError(OFMI_EMAIL_SMTP_PASSWORD_KEY),
      },
    });
  }

  public async sendEmail(mailOptions: MailOptions): Promise<void> {
    if (config.OFMI_EMAIL_SEND_EMAILS) {
      await this.transporter.sendMail(mailOptions);
    } else {
      console.info("INFO: Email not sent.", mailOptions);
    }
  }
}

export const emailer = new Emailer();
