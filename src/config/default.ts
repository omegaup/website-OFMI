const config = {
  isProduction: process.env.NODE_ENV === "production",

  BASE_URL: process.env.BASE_URL ?? "",

  VERIFICATION_TOKEN_EXPIRATION:
    process.env.VERIFICATION_TOKEN_EXPIRATION ?? "1d",

  OFMI_EMAIL_SEND_EMAILS: process.env.OFMI_EMAIL_SEND_EMAILS !== "false",

  GDRIVE_OFMI_ROOT_FOLDER:
    process.env.GDRIVE_OFMI_ROOT_FOLDER ?? "1_IQiMLZGEDvbXedZPIK3LTYLzZptGZPu",
};

export default config;
