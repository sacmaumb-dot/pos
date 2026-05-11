"use server";

import { getTenantPrismaServer } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getPlan } from "@/lib/plans";
import { getTenantFromHeader } from "@/lib/settings";

async function generateSku(tenantPrisma: any, categoryId: string): Promise<string> {
  // Get the category to find its skuPrefix
  const category = await tenantPrisma.category.findUnique({
    where: { id: categoryId },
  });
  const prefix = category?.skuPrefix || "SP";

  // Count existing products in this category to determine next number
  const count = await tenantPrisma.product.count({
    where: { categoryId },
  });
  const nextNum = count + 1;
  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

export async function createProduct(data: {
  sku?: string;
  name: string;
  brand?: string;
  categoryId: string;
  price: number;
  costPrice: number;
  stock: number;
  warranty: number;
  description?: string;
}) {
  try {
    const session = await requireSession();
    const tenantPrisma = await getTenantPrismaServer();
    const tenant = await getTenantFromHeader();
    
    if (tenant) {
      const plan = getPlan(tenant.subscriptionPlan);
      const count = await tenantPrisma.product.count();
      if (count >= plan.maxProducts) {
        return { ok: false as const, error: `Gói ${plan.name} giới hạn tối đa ${plan.maxProducts} sản phẩm. Vui lòng nâng cấp!` };
      }
    }

    // Auto-generate SKU if not provided
    let sku = data.sku?.trim();
    if (!sku) {
      sku = await generateSku(tenantPrisma, data.categoryId);
    }

    await tenantPrisma.product.create({
      data: {
        sku,
        name: data.name,
        brand: data.brand || null,
        categoryId: data.categoryId,
        price: data.price,
        costPrice: data.costPrice,
        stock: data.stock,
        warranty: data.warranty,
        description: data.description || null,
        tenantId: session.tenantId,
      },
    });
    revalidatePath("/products");
    revalidatePath("/pos");
    return { ok: true as const };
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return { ok: false as const, error: "SKU đã tồn tại" };
    }
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}

export async function updateProduct(
  id: string,
  data: {
    sku: string;
    name: string;
    brand?: string;
    categoryId: string;
    price: number;
    costPrice: number;
    stock: number;
    warranty: number;
    description?: string;
  },
) {
  try {
    await requireSession();
    await (await getTenantPrismaServer()).product.update({
      where: { id },
      data: {
        sku: data.sku,
        name: data.name,
        brand: data.brand || null,
        categoryId: data.categoryId,
        price: data.price,
        costPrice: data.costPrice,
        stock: data.stock,
        warranty: data.warranty,
        description: data.description || null,
      },
    });
    revalidatePath("/products");
    revalidatePath("/pos");
    return { ok: true as const };
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return { ok: false as const, error: "SKU đã tồn tại" };
    }
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireSession();
    await (await getTenantPrismaServer()).product.update({
      where: { id },
      data: { isActive: false },
    });
    revalidatePath("/products");
    revalidatePath("/pos");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}
