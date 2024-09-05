import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextApiHandler } from "next/types";
import { LoginUserRequest, LoginUserResponse } from "@/types/auth.schema";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import config from "@/config/default";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const userCredentials: LoginUserRequest = {
          email: credentials.email,
          password: credentials.password,
        };

        const res = await fetch(`${config.BASE_URL}/api/user/auth`, {
          method: "POST",
          body: JSON.stringify(userCredentials),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status == 401) {
          throw new Error("EmailNotVerified");
        }

        if (res.status !== 200) {
          const response = await res.json();

          if ("message" in response) {
            throw new Error(response.message);
          }

          return null;
        }

        if (!res.ok) {
          return null;
        }

        const response: LoginUserResponse = await res.json();

        return response.user;
      },
    }),
  ],

  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 24 * 30,
  },

  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },

  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user = {
          ...session.user,
          ...user,
        };
      }
      // For safety serialization
      if (session.user) {
        session.user.email = session.user.email ?? null;
        session.user.image = session.user.image ?? null;
        session.user.name = session.user.name ?? null;
      }
      return await session;
    },

    async jwt({ token, user }) {
      if (user) {
        token = {
          ...token,
          user,
        };
      }
      return await token;
    },
  },
};

const authHandler: NextApiHandler = (req, res) =>
  NextAuth(req, res, authOptions);

export default authHandler;
