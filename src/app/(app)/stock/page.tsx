import { getTenantPrismaServer } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { StockClient } from "./stock-client";

export const metadata = { title: "Quản lý kho" };

export default async function StockPage() {
  await requireSession();

  const [products, movements] = await Promise.all([
    (await getTenantPrismaServer()).product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
    (await getTenantPrismaServer()).stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        product: { select: { sku: true, name: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  return (
    <StockClient
      products={products
        .filter((p) => p.category.type !== "service")
        .map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          brand: p.brand,
          stock: p.stock,
          costPrice: p.costPrice,
          categoryName: p.category.name,
        }))}
      movements={movements.map((m) => ({
        id: m.id,
        type: m.type,
        quantity: m.quantity,
        before: m.before,
        after: m.after,
        unitCost: m.unitCost,
        reason: m.reason,
        reference: m.reference,
        createdAt: m.createdAt.toISOString(),
        productSku: m.product.sku,
        productName: m.product.name,
        userName: m.user.name,
      }))}
    />
  );
}
