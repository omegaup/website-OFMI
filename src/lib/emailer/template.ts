import type { MailOptions } from "nodemailer/lib/json-transport";

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
      tu cuenta y que puedas empezar a usar la página.</p>
      <p>Si tienes alguna duda por favor envía un correo a
      <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
      <br />
      <p>Equipo organizador de la OFMI</p>
    `,
  } as MailOptions;
};

export const signUpSuccessfulEmailTemplate = (email: string): MailOptions => {
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
