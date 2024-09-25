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
  };
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
  };
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
            ? `<p>¿Nos puedes compartir una foto tuya? Es para mostrarla 
                  durante la ceremonia virtual de clausura. Lo recomendado
                  es que sea en un fondo liso que se vea tu cara y tus
                  hombros :)</p>
               <p>La puedes subir a <a href="${gDriveFolder}">esta carpeta</a>
                  (si te pide acceso, solicítalo). Esta carpeta solo se 
                  compartirá contigo y con el equipo organizador de la OFMI.</p>
               <p>Por favor súbela junto con este formato de autorización de 
                  imagen:</p>
               <p>
                  <a href="https://drive.google.com/file/d/14iOtI2OQnd3gkPBdUNdX1m0DCv3u7iP0/view?usp=sharing">
                  Formato de autorización de uso de imagen para menores de edad</a>
               </p>
               <p>
                  <a href="https://drive.google.com/file/d/1TPzcGYJ9Mt0xWq-u_PcicwJTgs0YJYfG/view?usp=sharing">
                  Formato de autorización de uso de imagen para mayores de edad</a>
               </p>`
            : ""
        }
        <p>Si tienes alguna duda por favor envía un correo a
        <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
        <br />
        <p>Equipo organizador de la OFMI</p>
      `,
  };
};

export const passwordRecoveryAttemptTemplate = (
  email: string,
  url: string,
): MailOptions => {
  return {
    from: getSecretOrError(OFMI_EMAIL_SMTP_USER_KEY),
    to: email,
    subject: "Recuperación de contraseña de la OFMI",
    text: "Recuperación de contraseña de la OFMI",
    html: `
        <p>Estás recibiendo este correo porque se recibió una solicitud de recuperación de tu contraseña de la OFMI.</p>
        <p>Para continuar, haz click en el siguiente <a href="${url}">enlace</a>.</p>
        <p>Si no realizaste esta solicitud o tienes alguna duda, por favor envía un correo a
        <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
        <br />
        <p>Equipo organizador de la OFMI</p>
      `,
  };
};

export const successfulPasswordRecoveryTemplate = (
  email: string,
): MailOptions => {
  return {
    from: getSecretOrError(OFMI_EMAIL_SMTP_USER_KEY),
    to: email,
    subject: "Actualización de contraseña de la OFMI",
    text: "Actualización de contraseña de la OFMI",
    html: `
        <p>Estás recibiendo este correo porque la contraseña de tu cuenta de la OFMI ha sido cambiada.</p>
        <p>Si no realizaste este cambio o tienes alguna duda, por favor envía un correo a
        <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
        <br />
        <p>Equipo organizador de la OFMI</p>
      `,
  };
};
