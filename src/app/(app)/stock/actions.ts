"use server";

import { getTenantPrismaServer } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type StockInput = {
  productId: string;
  quantity: number;
  unitCost?: number;
  reason?: string;
  reference?: string;
};

async function recordMovement(
  type: "in" | "out" | "adjust",
  input: StockInput,
  userId: string,
  tenantId: string,
) {
  const product = await (await getTenantPrismaServer()).product.findUnique({
    where: { id: input.productId },
  });
  if (!product) return { ok: false as const, error: "Sản phẩm không tồn tại" };

  let delta = input.quantity;
  if (type === "out") delta = -Math.abs(delta);
  if (type === "in") delta = Math.abs(delta);

  const before = product.stock;
  const after = before + delta;
  if (after < 0)
    return {
      ok: false as const,
      error: `Tồn kho không đủ (hiện có ${before}, yêu cầu xuất ${Math.abs(delta)})`,
    };

  await (await getTenantPrismaServer()).$transaction([
    (await getTenantPrismaServer()).product.update({
      where: { id: input.productId },
      data: { stock: after },
    }),
    (await getTenantPrismaServer()).stockMovement.create({
      data: {
        type,
        quantity: delta,
        before,
        after,
        unitCost: type === "in" ? input.unitCost ?? 0 : 0,
        reason: input.reason || null,
        reference: input.reference || null,
        productId: input.productId,
        userId,
        tenantId,
      },
    }),
  ]);

  revalidatePath("/products");
  revalidatePath("/stock");
  revalidatePath("/pos");
  return { ok: true as const, before, after };
}

export async function stockIn(input: StockInput) {
  const session = await requireSession();
  if (!input.quantity || input.quantity <= 0)
    return { ok: false as const, error: "Số lượng phải lớn hơn 0" };
  return recordMovement("in", input, session.id, session.tenantId);
}

export async function stockOut(input: StockInput) {
  const session = await requireSession();
  if (!input.quantity || input.quantity <= 0)
    return { ok: false as const, error: "Số lượng phải lớn hơn 0" };
  return recordMovement("out", input, session.id, session.tenantId);
}

export async function stockAdjust(input: {
  productId: string;
  newStock: number;
  reason?: string;
}) {
  const session = await requireSession();
  if (input.newStock < 0)
    return { ok: false as const, error: "Tồn kho không thể âm" };
  const product = await (await getTenantPrismaServer()).product.findUnique({
    where: { id: input.productId },
  });
  if (!product) return { ok: false as const, error: "Sản phẩm không tồn tại" };
  const delta = input.newStock - product.stock;
  if (delta === 0) return { ok: true as const, before: product.stock, after: product.stock };

  await (await getTenantPrismaServer()).$transaction([
    (await getTenantPrismaServer()).product.update({
      where: { id: input.productId },
      data: { stock: input.newStock },
    }),
    (await getTenantPrismaServer()).stockMovement.create({
      data: {
        type: "adjust",
        quantity: delta,
        before: product.stock,
        after: input.newStock,
        unitCost: 0,
        reason: input.reason || "Kiểm kê",
        productId: input.productId,
        userId: session.id,
        tenantId: session.tenantId,
      },
    }),
  ]);

  revalidatePath("/products");
  revalidatePath("/stock");
  revalidatePath("/pos");
  return { ok: true as const, before: product.stock, after: input.newStock };
}
