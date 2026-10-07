export const ERROR_KEYS = [
  // Shared transport/session keys
  "NETWORK",
  "UNAUTHORIZED",
  "PERMISSION_DENIED",
  "RATE_LIMITED",
  "VALIDATION_FAILED",
  "UNKNOWN",
  // Permissions
  "PERMISSION_GRANT_EXCEEDED",
  // Roles
  "ROLE_NOT_FOUND",
  "ROLE_NAME_TAKEN",
  "ROLE_SUPER_ADMIN_IMMUTABLE",
  "ROLE_SUPER_ADMIN_NOT_ASSIGNABLE",
  "ROLE_SUPER_ADMIN_NOT_DEFAULTABLE",
  "ROLE_SYSTEM_NAME_LOCKED",
  "ROLE_SYSTEM_UNDELETABLE",
  "ROLE_IS_DEFAULT",
  // Authentication (better-auth)
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_EMAIL_NOT_VERIFIED",
  "AUTH_USER_EXISTS",
  "AUTH_PASSWORD_TOO_SHORT",
  "AUTH_PASSWORD_TOO_LONG",
  "AUTH_FAILED",
] as const;

export type ErrorKey = (typeof ERROR_KEYS)[number];

export const isErrorKey = (value: unknown): value is ErrorKey =>
  typeof value === "string" && (ERROR_KEYS as readonly string[]).includes(value);
