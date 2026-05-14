"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function generateSku(categoryId: string): Promise<string> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  const prefix = category?.skuPrefix || "SP";

  const count = await prisma.product.count({
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
    await requireSession();
    
    let sku = data.sku?.trim();
    if (!sku) {
      sku = await generateSku(data.categoryId);
    }

    await prisma.product.create({
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
    await prisma.product.update({
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
    await prisma.product.update({
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
