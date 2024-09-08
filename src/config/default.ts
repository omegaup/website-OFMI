const config = {
  isProduction: process.env.NODE_ENV === "production",

  BASE_URL: process.env.BASE_URL ?? "",

  VERIFICATION_EMAIL_SECRET: process.env.VERIFICATION_EMAIL_SECRET ?? "",
  VERIFICATION_TOKEN_EXPIRATION: process.env.VERIFICATION_TOKEN_EXPIRATION,

  OFMI_EMAIL_SEND_EMAILS: process.env.OFMI_EMAIL_SEND_EMAILS !== "false",
  OFMI_EMAIL_SMTP_USER: process.env.OFMI_EMAIL_SMTP_USER ?? "",
  OFMI_EMAIL_SMTP_PASSWORD: process.env.OFMI_EMAIL_SMTP_PASSWORD ?? "",

  CALENDLY_CLIENT_ID: process.env.CALENDLY_CLIENT_ID ?? "",
  CALENDLY_CLIENT_SECRET: process.env.CALENDLY_CLIENT_SECRET ?? "",

  GCLOUD_CLIENT_ID: process.env.GCLOUD_CLIENT_ID ?? "",
  GCLOUD_CLIENT_SECRET: process.env.GCLOUD_CLIENT_SECRET ?? "",
};

export default config;
