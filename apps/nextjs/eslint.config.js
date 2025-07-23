import baseConfig, { restrictEnvAccess } from "@lms/eslint-config/base";
import nextjsConfig from "@lms/eslint-config/nextjs";
import reactConfig from "@lms/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
