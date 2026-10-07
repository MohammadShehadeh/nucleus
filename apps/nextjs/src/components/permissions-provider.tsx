"use client";

import { hasAllPermissions, hasAnyPermission, hasPermission } from "@nucleus/db/rbac/check";
import type { PermissionKey } from "@nucleus/db/rbac/permissions";
import { createSafeContext } from "@nucleus/ui/lib/create-safe-context";
import type { ReactNode } from "react";

const [PermissionsContextProvider, usePermissionsContext] = createSafeContext<string[]>(
  "usePermissions must be used inside <PermissionsProvider>"
);

interface PermissionsProviderProps {
  permissions: string[];
  children: ReactNode;
}

/** Seeds the current user's effective permissions (from the session) to the client tree. */
export const PermissionsProvider = ({ permissions, children }: PermissionsProviderProps) => {
  return <PermissionsContextProvider value={permissions}>{children}</PermissionsContextProvider>;
};

export const usePermissions = () => {
  const permissions = usePermissionsContext();
  return {
    permissions,
    can: (permission: PermissionKey) => hasPermission(permissions, permission),
    canAll: (required: PermissionKey[]) => hasAllPermissions(permissions, required),
    canAny: (required: PermissionKey[]) => hasAnyPermission(permissions, required),
  };
};

interface CanProps {
  permission?: PermissionKey;
  anyOf?: PermissionKey[];
  allOf?: PermissionKey[];
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children only when the user satisfies the given permission(s). */
export const Can = ({ permission, anyOf, allOf, fallback = null, children }: CanProps) => {
  const { can, canAny, canAll } = usePermissions();

  let allowed = true;

  if (permission) allowed = can(permission);
  else if (anyOf) allowed = canAny(anyOf);
  else if (allOf) allowed = canAll(allOf);

  return <>{allowed ? children : fallback}</>;
};
