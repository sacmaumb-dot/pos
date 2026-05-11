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

// SaaS Isolation: Prisma Client Extension
export const getTenantPrisma = (tenantId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const tenantModels = [
            "AppSetting",
            "User",
            "Customer",
            "Category",
            "Product",
            "Sale",
            "ServiceTicket",
            "PrintTemplate",
            "StockMovement"
          ];

          if (tenantModels.includes(model)) {
            if (operation === "create" || operation === "createMany") {
              // Inject tenantId for creates
              if (args.data) {
                if (Array.isArray(args.data)) {
                  args.data = args.data.map(item => ({ ...item, tenantId }));
                } else {
                  (args.data as any).tenantId = tenantId;
                }
              }
            } else if (
              operation === "findUnique" ||
              operation === "findUniqueOrThrow" ||
              operation === "findFirst" ||
              operation === "findFirstOrThrow" ||
              operation === "findMany" ||
              operation === "update" ||
              operation === "updateMany" ||
              operation === "delete" ||
              operation === "deleteMany" ||
              operation === "count" ||
              operation === "aggregate" ||
              operation === "groupBy"
            ) {
              if (
                operation === "findFirst" ||
                operation === "findFirstOrThrow" ||
                operation === "findMany" ||
                operation === "updateMany" ||
                operation === "deleteMany" ||
                operation === "count" ||
                operation === "aggregate" ||
                operation === "groupBy"
              ) {
                args.where = { ...args.where, tenantId };
              }
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
