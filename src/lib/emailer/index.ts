import * as nodemailer from "nodemailer";
import type { MailOptions } from "nodemailer/lib/json-transport";
import {
  newUserEmailTemplate,
  ofmiRegistrationCompleteTemplate,
  signUpSuccessfulEmailTemplate,
  OFMI_EMAIL_SMTP_USER_KEY,
  passwordRecoveryAttemptTemplate,
  successfulPasswordRecoveryTemplate,
} from "./template";
import config from "@/config/default";
import { getSecretOrError } from "../secret";

const OFMI_EMAIL_SMTP_PASSWORD_KEY = "OFMI_EMAIL_SMTP_PASSWORD";

export class Emailer {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
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

  public async notifyUserForSignup(email: string, url: string): Promise<void> {
    await this.sendEmail(newUserEmailTemplate(email, url));
  }

  public async notifyUserSuccessfulSignup(email: string): Promise<void> {
    await this.sendEmail(signUpSuccessfulEmailTemplate(email));
  }

  public async notifySuccessfulOfmiRegistration(
    email: string,
    gDriveFolder?: string,
  ): Promise<void> {
    await this.sendEmail(ofmiRegistrationCompleteTemplate(email, gDriveFolder));
  }

  public async notifyPasswordRecoveryAttempt(
    email: string,
    url: string,
  ): Promise<void> {
    await this.sendEmail(passwordRecoveryAttemptTemplate(email, url));
  }

  public async notifySuccessfulPasswordRecovery(email: string): Promise<void> {
    await this.sendEmail(successfulPasswordRecoveryTemplate(email));
  }
}

export const emailer = new Emailer();
