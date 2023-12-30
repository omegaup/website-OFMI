
import * as nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";

export class Emailer {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.OFMI_EMAIL_SMTP_USER,
        pass: process.env.OFMI_EMAIL_SMTP_PASSWORD
      },
    });
  }

  public sendEmail(mailOptions: MailOptions) {
    return this.transporter.sendMail(mailOptions);
  }

  public notifyUserForSignup(email: string) {
    this.sendEmail(newUserEmailTemplate(email));
  }

  public notifyUserSuccessfulSignup(email: string) {
    this.sendEmail(signUpSuccessfullEmailTemplate(email));
  }
}

export const emailer = new Emailer();

export const newUserEmailTemplate = (email: string) => {
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

export const signUpSuccessfullEmailTemplate = (email: string) => {
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
  