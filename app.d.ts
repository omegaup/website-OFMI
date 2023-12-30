// app.d.ts
/// <reference types="lucia" />

import { Role } from "@prisma/client";

declare namespace Lucia {
	type Auth = import("./auth/lucia").Auth;
	type DatabaseUserAttributes = {
        email: string;
        password: string;
        role: Role;
        createdAt: DateTime;
        updatedAt: DateTime;
    };
	type DatabaseSessionAttributes = {};
}