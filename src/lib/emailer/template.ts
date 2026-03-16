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
		-- vim.g.sonokai_transparent_background = "2"
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
    subject:
      "¡Bienvenida a la 5a Olimpiada Femenil Mexicana de Informática (OFMI)!",
    text: "Te has registrado exitosamente a la OFMI",
    html: `
        <p>Ahora ya tienes un lugar en la OFMI.</p>
        <p>
        Hola 👋,
¡Gracias por registrarte en la 5ª Olimpiada Femenil Mexicana de Informática (OFMI)! 🎉
Nos emociona muchísimo que formes parte de esta edición. Queremos que sepas que la OFMI
es una comunidad segura, incluyente y de aprendizaje, y esperamos que te sientas bienvenida
desde este primer momento 💜
        </p>
        <p><strong>Recursos de preparación</strong></p>
        <p>No necesitas saber programar previamente para participar. En esta edición contamos con
        varios recursos para apoyarte durante todo el proceso:</p>
        <br />
        <ul>
            <li>
                <p><strong>Curso de la OFMI en OmegaUp (desde lo más básico) (opcional)</strong></p>
                <p>Incluye videos y problemas recomendados para practicar a tu ritmo. <a href="https://omegaup.com/course/Intro-OFMI/">Curso</a>
                </p>
            </li>
            <li>
                <p><strong>Mentorías personalizadas (opcional)</strong></p>
                <p>Si tienes dudas sobre algún tema o ejercicio, puedes agendar una sesión 1 a 1 con una
mentora o mentor. Puedes ver los días y horarios disponibles en el siguiente link. <a href="https://ofmi.omegaup.com/mentorias">Mentorías</a>
</p>
            </li>
            <li>
                <p><strong>Office hours semanales (opcional)</strong></p>
                <p>A partir de febrero tendremos sesiones abiertas para resolver dudas generales una vez a la
semana. No necesitas reservar, solo conectarte.
👉 Lunes a las 7PM hora centro del país en el siguiente link
 <a href="https://meet.google.com/khj-zbjf-ezp">Google meet link</a></p>
            </li>
            <li>
                <p><strong>Días OFMI ✨</strong></p>
                <p>Tendremos algunos días especiales para conocernos mejor, generar comunidad, hacer
actividades juntas y llevarnos algunas sorpresas. Para poder obtener mención honorífica en la OFMI, es necesario asistir al menos a uno de los Días OFMI.</p>
                <p>Las fechas confirmadas son:</p>
                <ul>
                    <li>
                      <p>Domingo 15 de marzo 12 PM (hora centro)</p>
                      <a href="https://meet.google.com/ido-yswx-xgn" target="_blank">👉 https://meet.google.com/ido-yswx-xgn</a>
                    </li>
                    <li>
                      <p>Domingo 12 de abril 12 PM (hora centro)</p>
                      <a href="https://meet.google.com/iyq-zbfs-jzk" target="_blank">👉 https://meet.google.com/iyq-zbfs-jzk</a>
                    </li>
                    <li>
                      <p>En mayo tendremos una tercera sesión (fecha por confirmar)</p>
                    </li>
                </ul>
            </li>
        </ul>
        ${
          gDriveFolder
            ? `<p><strong>📸 Foto para la inauguración</strong></p>
            <p>¿Nos puedes compartir una foto tuya? Es para mostrarla
                  durante la ceremonia virtual de clausura. Lo recomendado
                  es que sea en un fondo liso que se vea tu cara y tus
                  hombros :)</p>
               <p>La puedes subir a <a href="${gDriveFolder}">esta carpeta</a>
                  (si te pide acceso, solicítalo). Esta carpeta solo se
                  compartirá contigo y con el equipo organizador de la OFMI.</p>
               <p>Por favor súbela junto con este formato de autorización de
                  imagen:</p>
               <p>
                  <a href="https://drive.google.com/file/d/10luKnstOTS-SnwClH-UQEcgWzC_yoYhD/view?usp=sharing">
                  Formato de autorización de uso de imagen para menores de edad</a>
               </p>
               <p>
                  <a href="https://drive.google.com/file/d/1LgR6sU6r7BEJqtstCC7AQ_kt-cmJQZar/view?usp=sharing">
                  Formato de autorización de uso de imagen para mayores de edad</a>
               </p>`
            : ""
        }
        <p><strong>💬 Comunidad de WhatsApp</strong></p>
        <p>
        También puedes unirte al grupo oficial de WhatsApp de participantes, donde compartiremos avisos importantes, recordatorios y novedades de la olimpiada. Unirte es opcional, pero muy recomendado.
        Únete aquí: <a href="https://chat.whatsapp.com/GezIY8iaWGkKenpcUzl0dE">Grupo de whatsapp</a>
        </p>
        <p>
            Finalmente, <strong>te recordamos que desde el 2 de febrero de 2026 podrás elegir la sede donde
            presentarás el examen</strong>, una vez que las sedes oficiales sean publicadas.
            Si tienes cualquier duda, puedes escribirnos con toda confianza a ofmi@omegaup.com.
            ¡Gracias por ser parte de esta edición y nos vemos pronto! 💜
        </p>
        <p>Con cariño,<p>
        <p>Equipo organizador de la OFMI</p>
        <p>Olimpiada Femenil Mexicana de Informática (OFMI)</p>
        <p>OmegaUp</p>
        <a href="mailto:ofmi@omegaup.com">ofmi@omegaup.com</a></p>
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
