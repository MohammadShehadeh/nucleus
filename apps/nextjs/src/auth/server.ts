import "server-only";

import { initAuth } from "@nucleus/auth";
import { headers } from "next/headers";
import { cache } from "react";

import { env } from "@/env";

const baseUrl =
  env.VERCEL_ENV === "production" ? env.NEXT_PUBLIC_BASE_URL : "http://localhost:3000";

export const auth = initAuth({
  baseUrl,
  productionUrl: env.NEXT_PUBLIC_BASE_URL,
  secret: env.AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));
