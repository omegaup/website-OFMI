import * as nodemailer from "nodemailer";
import type { MailOptions } from "nodemailer/lib/json-transport";
import {
  newUserEmailTemplate,
  ofmiRegistrationCompleteTemplate,
  signUpSuccessfulEmailTemplate,
} from "./template";

export class Emailer {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.OFMI_EMAIL_SMTP_USER,
        pass: process.env.OFMI_EMAIL_SMTP_PASSWORD,
      },
    });
  }

  public async sendEmail(mailOptions: MailOptions): Promise<void> {
    return await this.transporter.sendMail(mailOptions);
  }

  public async notifyUserForSignup(email: string, url: string): Promise<void> {
    await this.sendEmail(newUserEmailTemplate(email, url));
  }

  public async notifyUserSuccessfulSignup(email: string): Promise<void> {
    await this.sendEmail(signUpSuccessfulEmailTemplate(email));
  }

  public async notifySuccessfulOfmiRegistration(email: string): Promise<void> {
    await this.sendEmail(ofmiRegistrationCompleteTemplate(email));
  }
}

export const emailer = new Emailer();
