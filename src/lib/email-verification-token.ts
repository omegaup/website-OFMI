import jwt from "jsonwebtoken";
import { emailer } from "./emailer";

export default function generateAndSendVerificationToken(userId: string, email: string): void {
    const emailToken: string = jwt.sign(
        {
          user: userId,
        },
        process.env.VERIFICATION_EMAIL_SECRET as string,
        {
          expiresIn: process.env.VERIFICATION_TOKEN_EXPIRATION,
        },
      );
  
      const url: string = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/${emailToken}`;
  
      emailer.notifyUserForSignup(email, url);
}