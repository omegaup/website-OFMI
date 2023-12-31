import * as nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";

export const newUserEmailTemplate = (
  email: string,
  url: string,
): MailOptions => {
  return {
    from: process.env.OFMI_EMAIL_SMTP_USER,
    to: email,
    subject: "Verifica tu cuenta de la página de la OFMI",
    text: "Verifica tu cuenta de la página de la OFMI",
    html: `
      <p>Gracias por registrarte en la página de la OFMI.</p>
      <p>Por favor da click en <a href="${url}">esta liga</a> para verificar 
      tu cuenta y que puedas empezar a usar la página </p>
      <p>Si tienes alguna duda por favor envía un correo a
      <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
      <br />
      <p>Equipo organizador de la OFMI</p>
    `,
  } as MailOptions;
};

export const signUpSuccessfullEmailTemplate = (email: string): MailOptions => {
  return {
    from: process.env.OFMI_EMAIL_SMTP_USER,
    to: email,
    subject: "La página de la OFMI te da la bienvenida",
    text: "La página de la OFMI te da la bienvenida",
    html: `
        <p>Ahora ya tienes un login para usar la página de la OFMI.</p>
        <p>Es muy importante que recuerdes que este login no significa que ya estés participando en la OFMI, para ese registro tienes que ir a la liga de 
        <a href="https://ofmi.omegaup.com/registro">Registro</a> </p>
        <p>Si tienes alguna duda por favor envía un correo a
        <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
        <br />
        <p>Equipo organizador de la OFMI</p>
      `,
  } as MailOptions;
};

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

  public sendEmail(mailOptions: MailOptions): Promise<void> {
    return this.transporter.sendMail(mailOptions);
  }

  public notifyUserForSignup(email: string, url: string): void {
    this.sendEmail(newUserEmailTemplate(email, url));
  }

  public notifyUserSuccessfulSignup(email: string): void {
    this.sendEmail(signUpSuccessfullEmailTemplate(email));
  }
}

export const emailer = new Emailer();
