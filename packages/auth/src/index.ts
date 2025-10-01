import { expo } from "@better-auth/expo";
import { db } from "@lms/db/client";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { oAuthProxy } from "better-auth/plugins";

interface InitAuthOptions {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
  socialProviders: {
    google: {
      clientId: string;
      clientSecret: string;
    };
  };
}

export function initAuth(options: InitAuthOptions) {
  const config = {
    appName: "Learning Management System (LMS)",
    emailAndPassword: {
      enabled: true,
    },
    account: {
      accountLinking: {
        trustedProviders: ["google"],
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    socialProviders: {
      /**
       * Google social provider https://www.better-auth.com/docs/authentication/google
       */
      google: {
        prompt: "select_account",
        clientId: options.socialProviders.google.clientId,
        clientSecret: options.socialProviders.google.clientSecret,
      },
    },
    plugins: [
      oAuthProxy({
        /**
         * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
         */
        currentURL: options.baseUrl,
        productionURL: options.productionUrl,
      }),
      expo(),
      nextCookies(), // make sure this is the last plugin in the array
    ],
    trustedOrigins: ["expo://"],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
