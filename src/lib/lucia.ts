import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";
import { cache } from "react";
import * as context from "next/headers";

const client = new PrismaClient();

export const auth = lucia({
	env: "DEV", // "PROD" if deployed to HTTPS
	middleware: nextjs_future(), // NOT nextjs()
	sessionCookie: {
		expires: false
	},

    adapter: prisma(client),

    getUserAttributes: (data) => {
		return {
			email: data.email
		};
	}
});

export type Auth = typeof auth;

export const getPageSession = cache(() => {
	const authRequest = auth.handleRequest("GET", context);
	return authRequest.validate();
});