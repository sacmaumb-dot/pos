"use server";

import { getTenantPrismaServer } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCategory(data: {
  name: string;
  type: string;
  skuPrefix: string;
  icon: string;
}) {
  try {
    const session = await requireSession();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await (await getTenantPrismaServer()).category.create({
      data: {
        name: data.name,
        slug,
        type: data.type,
        skuPrefix: data.skuPrefix.toUpperCase(),
        icon: data.icon || "",
        tenantId: session.tenantId,
      },
    });
    revalidatePath("/categories");
    revalidatePath("/products");
    revalidatePath("/pos");
    return { ok: true as const };
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return { ok: false as const, error: "Danh mục đã tồn tại" };
    }
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}

export async function updateCategory(
  id: string,
  data: { name: string; type: string; skuPrefix: string; icon: string },
) {
  try {
    await requireSession();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await (await getTenantPrismaServer()).category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        type: data.type,
        skuPrefix: data.skuPrefix.toUpperCase(),
        icon: data.icon || "",
      },
    });
    revalidatePath("/categories");
    revalidatePath("/products");
    revalidatePath("/pos");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireSession();
    const tp = await getTenantPrismaServer();
    // Check if any products use this category
    const productCount = await tp.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return { ok: false as const, error: `Không thể xoá — có ${productCount} sản phẩm đang sử dụng danh mục này` };
    }
    await tp.category.delete({ where: { id } });
    revalidatePath("/categories");
    revalidatePath("/products");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}
