import { db } from "@leconn/db";
import * as schema from "@leconn/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  user: {
    fields: {},
    additionalFields: {
      username: {
        type: "string",
      },
      bio: {
        type: "string",
      },
      website: {
        type: "string",
      },
      banner: {
        type: "string",
      },
      createdAt: {
        type: "string",
      },
    },
  },
});
export type Auth = typeof auth;
