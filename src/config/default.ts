const config = {
  isProduction: process.env.NODE_ENV === "production",

  BASE_URL: process.env.BASE_URL ?? "",

  VERIFICATION_TOKEN_EXPIRATION:
    process.env.VERIFICATION_TOKEN_EXPIRATION ?? "1d",

  OFMI_EMAIL_SEND_EMAILS: process.env.OFMI_EMAIL_SEND_EMAILS !== "false",

  GDRIVE_OFMI_ROOT_FOLDER: process.env.GDRIVE_OFMI_ROOT_FOLDER ?? "",

  OFMI_USER_EMAIL: process.env.OFMI_USER_EMAIL ?? "ofmi@omegaup.com",
};

export default config;
