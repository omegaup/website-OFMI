const config = {
  isProduction: process.env.NODE_ENV === "production",

  VERIFICATION_EMAIL_SECRET: process.env.VERIFICATION_EMAIL_SECRET ?? "",
  VERIFICATION_TOKEN_EXPIRATION: process.env.VERIFICATION_TOKEN_EXPIRATION,

  SESSION_TOKEN_SECRET: process.env.SESSION_TOKEN_SECRET ?? "",
  SESSION_TOKEN_EXPIRATION: process.env.SESSION_TOKEN_EXPIRATION,

  dummyDataLength: 10, // prisma seed data length
};

export default config;
