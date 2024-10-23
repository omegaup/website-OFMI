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

export const contestantDisqualificationTemplate = (
  email: string,
  ofmiName: string,
  preferredName: string,
  shortReason: string,
): MailOptions => {
  let longReason = shortReason;
  switch (shortReason) {
    case "NO_ELEGIBLE":
      longReason =
        "No cumples con todos los criterios de eligibilidad senalados en la convocatoria";
      break;
    case "IA":
      longReason =
        "Usaste herramientas de Inteligencia Artificial, para autocompletar/generar codigo u obtener la solucion a un problema";
      break;
    case "SUMINISTROS_PROHIBIDOS":
      longReason =
        "Usaste, durante la competencia, uno o varios suministros que no estan explicitamente mencionados en la seccion de Suministros de la convocatoria";
      break;
    case "MATERIAL_PROHIBIDO":
      longReason =
        "Usaste, durante el examen, uno o varios materiales que no estan explicitamente mencionados en la seccion de Material Permitido de la convocatoria";
      break;
    case "MALA_GRABACION":
      longReason =
        "No se pudo verificar tu identidad y que seguiste el reglamento durante la competencia con las grabaciones que enviaste";
      break;
    case "MULTICUENTAS":
      longReason =
        "Durante el concurso, iniciaste sesion en una cuenta de OmegaUp distinta a la que se te asigno para la competencia";
      break;
    case "COMUNICACION_PROHIBIDA":
      longReason =
        "Te comunicaste, durante el concurso, con personas que no son parte del Comite Organizador";
      break;
    case "FALTA_GRABACION":
      longReason = "No subiste tu grabacion del dia 1 o del dia 2";
      break;
    case "MALA_CONDUCTA":
      longReason = "No cumpliste con el Codigo de Conducta";
      break;
  }
  return {
    from: getSecretOrError(OFMI_EMAIL_SMTP_USER_KEY),
    to: email,
    subject: `Descalificación de la ${ofmiName}`,
    text: `Descalificación de la ${ofmiName}`,
    html: `
        <p>Hola, ${preferredName}!</p>
        <p>Te informamos que, lamentablemente, sido descalificade de la ${ofmiName} por el siguiente motivo: </p>
        <p>${longReason}.</p>
        <p>Si tienes alguna duda, quieres mas informacion o te gustaria realizar una apelacion, por favor envía un correo a
        <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
        <br />
        <p>Equipo organizador de la OFMI</p>
      `,
  };
};

export const contestantDisqualificationAppealTemplate = (
  email: string,
  ofmiName: string,
  preferredName: string,
  appealed: boolean,
): MailOptions => {
  return {
    from: getSecretOrError(OFMI_EMAIL_SMTP_USER_KEY),
    to: email,
    subject: `(Actualizacion) Descalificación de la ${ofmiName}`,
    text: `(Actualizacion) Descalificación de la ${ofmiName}`,
    html: `
        <p>Hola, ${preferredName}!</p>
        <p>Te informamos que la apelacion a tu descalificacion de la ${ofmiName} ha sido ${appealed ? "aceptada" : "rechazada"}.</p>
        <p>En otras palabras, hemos ${appealed ? "retractado" : "reafirmado"} nuestra decision de descalificarte.</p>
        <p>Si tienes alguna duda o te gustaria realizar otra apelacion, por favor envía un correo a
        <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
        <br />
        <p>Equipo organizador de la OFMI</p>
      `,
  };
};
