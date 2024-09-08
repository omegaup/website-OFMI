import config from "@/config/default";
import type { MailOptions } from "nodemailer/lib/json-transport";
import { getSecretOrError } from "../secret";

export const OFMI_EMAIL_SMTP_USER_KEY = "OFMI_EMAIL_SMTP_USER";

export const newUserEmailTemplate = (
  email: string,
  url: string,
): MailOptions => {
  return {
    from: getSecretOrError(OFMI_EMAIL_SMTP_USER_KEY),
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
    from: getSecretOrError(OFMI_EMAIL_SMTP_USER_KEY),
    to: email,
    subject: "La página de la OFMI te da la bienvenida",
    text: "La página de la OFMI te da la bienvenida",
    html: `
        <p>Ahora ya tienes un login para usar la página de la OFMI.</p>
        <p>Es muy importante que recuerdes que este login no significa que ya estés participando en la OFMI, para ese registro tienes que ir a la liga de 
        <a href="${config.BASE_URL}/registro">Registro</a> </p>
        <p>Si tienes alguna duda por favor envía un correo a
        <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
        <br />
        <p>Equipo organizador de la OFMI</p>
      `,
  } as MailOptions;
};

export const ofmiRegistrationCompleteTemplate = (
  email: string,
  gDriveFolder?: string,
): MailOptions => {
  return {
    from: getSecretOrError(OFMI_EMAIL_SMTP_USER_KEY),
    to: email,
    subject: "Te has registrado exitosamente a la OFMI",
    text: "Te has registrado exitosamente a la OFMI",
    html: `
        <p>Ahora ya tienes un lugar en la OFMI.</p>
        ${
          gDriveFolder
            ? `<p> ¿Nos puedes compartir una foto tuya? 
                  Es para mostrar durante la ceremonia virtual de clausura. 
                  Lo recomendado es que sea en un fondo liso que se vea tu cara y tus hombros :) 
                  La puedes subir a <a href="${gDriveFolder}">este folder</a>
               </p>
               <p>Por favor envíala junto con este formato de autorización de imagen:</p>
               <p><a href="https://drive.google.com/file/d/1VpJ08JoYcy1rYCLEVrJ16-hg_q8H6KIS/view?usp=sharing">
                  Formato de autorización de uso de imagen para menores de edad
               </a></p>
               <p><a href="https://drive.google.com/file/d/1rEn7vLgh1U3ecaoea4GixX6goi-1rEi4/view?usp=sharing">
                  Formato de autorización de uso de imagen para mayores de edad
               </a></p>`
            : ""
        }
        <p>Si tienes alguna duda por favor envía un correo a
        <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
        <br />
        <p>Equipo organizador de la OFMI</p>
      `,
  } as MailOptions;
};
