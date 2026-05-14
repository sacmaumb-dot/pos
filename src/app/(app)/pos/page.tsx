import { prisma } from "@/lib/prisma";
import { WorkspaceClient } from "./workspace-client";

export default async function PosPage() {
  const [products, categories, customers, technicians] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      take: 200,
    }),
    prisma.user.findMany({
      where: { role: { in: ["technician", "admin"] }, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-3">
      <WorkspaceClient
        products={products.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          brand: p.brand,
          price: p.price,
          stock: p.stock,
          categoryType: p.category.type,
          categoryIcon: p.category.icon,
          categoryId: p.categoryId,
        }))}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          icon: c.icon,
        }))}
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          code: c.code,
        }))}
        technicians={technicians}
      />
    </div>
  );
}
