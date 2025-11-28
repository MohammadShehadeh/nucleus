import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@lms/api", "@lms/auth", "@lms/db", "@lms/ui", "@lms/validators"],

  // images
  images: {
    remotePatterns: [{ protocol: "https", hostname: "mohammadshehadeh.com" }],
  },

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },

  /** Output a standalone server for Docker */
  output: "standalone",
};

export default config;
