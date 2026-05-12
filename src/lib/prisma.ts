import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Models with a direct `tenantId` column. The extension auto-injects tenantId
// on create and auto-filters every other operation by tenantId.
const TENANT_MODELS = new Set<string>([
  "AppSetting",
  "Branch",
  "Category",
  "Customer",
  "PrintTemplate",
  "Product",
  "Sale",
  "ServiceTicket",
  "Session",
  "StockMovement",
  "User",
]);

// Child models that do not have a direct tenantId column. They are scoped via
// the parent relation listed here (e.g. SaleItem -> sale.tenantId). The
// extension injects `where[parent] = { tenantId }` so cross-tenant access
// through guessed child ids is prevented.
const CHILD_TENANT_PARENTS: Record<string, string> = {
  Notification: "user",
  ProductBranchStock: "product",
  SaleItem: "sale",
  ServiceItem: "ticket",
  ServiceStatusHistory: "ticket",
};

const READ_FILTER_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "updateMany",
  "deleteMany",
]);

// Operations that act on a unique record. Prisma 5+ allows non-unique fields
// in WhereUniqueInput (extendedWhereUnique is the default), so injecting the
// tenant filter here narrows the row at the SQL level — preventing
// cross-tenant access via guessed/leaked ids.
const UNIQUE_OPS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "update",
  "delete",
]);

function hasCompoundTenantKey(where: Record<string, unknown> | undefined): boolean {
  if (!where) return false;
  for (const k of Object.keys(where)) {
    if (k === "tenantId") return true;
    if (k.startsWith("tenantId_")) return true;
  }
  return false;
}

// SaaS Isolation: Prisma Client Extension
export const getTenantPrisma = (tenantId: string) => {
  return prisma.$extends({
    name: "tenant-isolation",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const isTenantModel = TENANT_MODELS.has(model);
          const childParent = CHILD_TENANT_PARENTS[model];

          if (!isTenantModel && !childParent) {
            return query(args);
          }

          // $allOperations args is intentionally a loose union — narrow to a
          // mutable shape so we can attach where/data scoping.
          const mutableArgs = args as {
            data?: Record<string, unknown> | Record<string, unknown>[];
            where?: Record<string, unknown>;
            create?: Record<string, unknown> | Record<string, unknown>[];
            update?: Record<string, unknown>;
          };

          // Direct-tenant models: inject tenantId on every code path.
          if (isTenantModel) {
            if (operation === "create") {
              if (mutableArgs.data && !Array.isArray(mutableArgs.data)) {
                mutableArgs.data = { ...mutableArgs.data, tenantId };
              }
            } else if (operation === "createMany") {
              if (Array.isArray(mutableArgs.data)) {
                mutableArgs.data = mutableArgs.data.map((d) => ({ ...d, tenantId }));
              } else if (mutableArgs.data) {
                mutableArgs.data = { ...mutableArgs.data, tenantId };
              }
            } else if (operation === "upsert") {
              if (!hasCompoundTenantKey(mutableArgs.where)) {
                mutableArgs.where = { ...(mutableArgs.where ?? {}), tenantId };
              }
              if (mutableArgs.create && !Array.isArray(mutableArgs.create)) {
                mutableArgs.create = { ...mutableArgs.create, tenantId };
              }
            } else if (READ_FILTER_OPS.has(operation)) {
              mutableArgs.where = { ...(mutableArgs.where ?? {}), tenantId };
            } else if (UNIQUE_OPS.has(operation)) {
              if (!hasCompoundTenantKey(mutableArgs.where)) {
                mutableArgs.where = { ...(mutableArgs.where ?? {}), tenantId };
              }
            }
          }

          // Child models: scope through parent relation. We only filter reads
          // and mutations — create still relies on the caller passing a valid
          // parent FK (the parent itself is already tenant-scoped, so a
          // foreign-tenant FK would be impossible to obtain through normal
          // flows).
          if (childParent) {
            const inject = { [childParent]: { tenantId } };
            if (
              READ_FILTER_OPS.has(operation) ||
              UNIQUE_OPS.has(operation)
            ) {
              mutableArgs.where = { ...(mutableArgs.where ?? {}), ...inject };
            } else if (operation === "upsert") {
              mutableArgs.where = { ...(mutableArgs.where ?? {}), ...inject };
            }
          }

          return query(args);
        },
      },
    },
  });
};

import { requireSession } from "@/lib/auth";
export const getTenantPrismaServer = async () => {
  const session = await requireSession();
  return getTenantPrisma(session.tenantId);
};
