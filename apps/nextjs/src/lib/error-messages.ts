import { type ErrorKey, isErrorKey } from "@nucleus/api/error-keys";
import type { AppRouter } from "@nucleus/api/root";
import { isTRPCClientError } from "@trpc/client";

const ERROR_MESSAGES: Record<ErrorKey, string> = {
  NETWORK: "Connection failed. Check your internet and try again.",
  UNAUTHORIZED: "You need to sign in to do that.",
  PERMISSION_DENIED: "You don't have permission to do that.",
  RATE_LIMITED: "Too many requests. Give it a moment and try again.",
  VALIDATION_FAILED: "Some of the details you entered aren't valid.",
  UNKNOWN: "Something went wrong. Please try again.",
  PERMISSION_GRANT_EXCEEDED: "You can only grant permissions you hold yourself.",
  ROLE_NOT_FOUND: "That role no longer exists.",
  ROLE_NAME_TAKEN: "A role with a similar name already exists.",
  ROLE_SUPER_ADMIN_IMMUTABLE: "The super admin role can't be modified.",
  ROLE_SUPER_ADMIN_NOT_ASSIGNABLE: "The super admin role can't be assigned.",
  ROLE_SUPER_ADMIN_NOT_DEFAULTABLE: "The super admin role can't be the default.",
  ROLE_SYSTEM_NAME_LOCKED: "System role names can't be changed.",
  ROLE_SYSTEM_UNDELETABLE: "System roles can't be deleted.",
  ROLE_IS_DEFAULT: "Set another role as default before deleting this one.",
  AUTH_INVALID_CREDENTIALS: "Invalid email or password.",
  AUTH_EMAIL_NOT_VERIFIED: "Verify your email address before signing in.",
  AUTH_USER_EXISTS: "An account with this email already exists.",
  AUTH_PASSWORD_TOO_SHORT: "That password is too short.",
  AUTH_PASSWORD_TOO_LONG: "That password is too long.",
  AUTH_FAILED: "Authentication failed. Please try again.",
};

/** Resolves an ErrorKey, or the `errorKey` on a tRPC client error, to user-facing copy. */
export const getErrorMessage = (error: unknown): string => {
  if (isErrorKey(error)) return ERROR_MESSAGES[error];
  if (!isTRPCClientError<AppRouter>(error)) return ERROR_MESSAGES.UNKNOWN;
  // No error shape means the request never got a tRPC response (offline, DNS, CORS).
  if (!error.data) return ERROR_MESSAGES.NETWORK;
  return ERROR_MESSAGES[error.data.errorKey];
};

const AUTH_ERROR_KEYS: Partial<Record<string, ErrorKey>> = {
  INVALID_EMAIL_OR_PASSWORD: "AUTH_INVALID_CREDENTIALS",
  INVALID_EMAIL: "AUTH_INVALID_CREDENTIALS",
  INVALID_PASSWORD: "AUTH_INVALID_CREDENTIALS",
  USER_NOT_FOUND: "AUTH_INVALID_CREDENTIALS",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "AUTH_INVALID_CREDENTIALS",
  EMAIL_NOT_VERIFIED: "AUTH_EMAIL_NOT_VERIFIED",
  USER_ALREADY_EXISTS: "AUTH_USER_EXISTS",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "AUTH_USER_EXISTS",
  PASSWORD_TOO_SHORT: "AUTH_PASSWORD_TOO_SHORT",
  PASSWORD_TOO_LONG: "AUTH_PASSWORD_TOO_LONG",
};

interface AuthClientError {
  code?: string;
  status: number;
}

/** Maps a better-auth client error (`{ code, status }`) to an ErrorKey; unknown codes become AUTH_FAILED. */
export const authErrorKey = ({ code, status }: AuthClientError): ErrorKey => {
  if (status === 429) return "RATE_LIMITED";
  return (code && AUTH_ERROR_KEYS[code]) || "AUTH_FAILED";
};
