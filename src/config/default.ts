const config = {
  isProduction: process.env.NODE_ENV === "production",

  VERIFICATION_EMAIL_SECRET: process.env.VERIFICATION_EMAIL_SECRET ?? "",
  VERIFICATION_TOKEN_EXPIRATION: process.env.VERIFICATION_TOKEN_EXPIRATION,

  OFMI_EMAIL_SEND_EMAILS: process.env.OFMI_EMAIL_SEND_EMAILS !== "false",

  dummyDataLength: 10, // prisma seed data length
};

export default config;
