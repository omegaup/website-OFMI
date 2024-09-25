import {
  newUserEmailTemplate,
  ofmiRegistrationCompleteTemplate,
  passwordRecoveryAttemptTemplate,
  signUpSuccessfulEmailTemplate,
  successfulPasswordRecoveryTemplate,
} from "./template";
import type { MailOptions } from "nodemailer/lib/json-transport";

export abstract class BaseEmailer {
  protected abstract sendEmail(mailOptions: MailOptions): Promise<void>;

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
