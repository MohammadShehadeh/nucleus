import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { dbEnv } from "../env";
import * as rbacSchema from "./schema/rbac";
import * as rbacRelations from "./schema/relations/rbac";
import * as userRelations from "./schema/relations/user";
import * as userSchema from "./schema/user";

const nonPoolingUrl = dbEnv().POSTGRES_URL.replace(":6543", ":5432");

export const db = drizzle({
  client: postgres(nonPoolingUrl),
  schema: { ...rbacSchema, ...rbacRelations, ...userSchema, ...userRelations },
  casing: "snake_case",
});
