"use server";

import { getTenantPrismaServer, prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { nextSaleCode, nextCustomerCode } from "@/lib/code-sequence";

type Item = {
  productId: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  imei?: string;
};

export async function createSale(input: {
  items: Item[];
  customerId?: string;
  newCustomer?: { name: string; phone: string };
  paymentMethod: string;
  discount: number;
  note: string;
}) {
  try {
    const session = await requireSession();
    if (input.items.length === 0) {
      return { ok: false as const, error: "Giỏ hàng trống" };
    }

    let resolvedCustomerId: string | null = input.customerId || null;
    if (!resolvedCustomerId && (!input.newCustomer || !input.newCustomer.phone?.trim() || !input.newCustomer.name?.trim())) {
      return {
        ok: false as const,
        error: "Vui lòng chọn hoặc thêm khách hàng (SĐT + tên)",
      };
    }
    if (!resolvedCustomerId && input.newCustomer && input.newCustomer.name.trim()) {
      const phone = input.newCustomer.phone.trim();
      const name = input.newCustomer.name.trim();
      if (!phone) {
        return { ok: false as const, error: "SĐT khách hàng không hợp lệ" };
      }
      const existing = await (await getTenantPrismaServer()).customer.findFirst({ where: { phone } });
      if (existing) {
        resolvedCustomerId = existing.id;
      } else {
        const code = await nextCustomerCode(prisma, session.tenantId);
        const created = await (await getTenantPrismaServer()).customer.create({
          data: {
            code,
            name,
            phone,
            tenantId: session.tenantId,
          },
        });
        resolvedCustomerId = created.id;
      }
    }

    // Validate stock
    const productIds = input.items.map((i) => i.productId);
    const products = await (await getTenantPrismaServer()).product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });
    for (const item of input.items) {
      const p = products.find((x) => x.id === item.productId);
      if (!p) return { ok: false as const, error: "Sản phẩm không tồn tại" };
      if (p.category.type !== "service" && p.stock < item.quantity) {
        return {
          ok: false as const,
          error: `"${p.name}" không đủ tồn kho (còn ${p.stock})`,
        };
      }
    }

    const subtotal = input.items.reduce(
      (s, i) => s + i.unitPrice * i.quantity - (i.discount || 0),
      0,
    );
    const total = Math.max(0, subtotal - (input.discount || 0));

    const sale = await (await getTenantPrismaServer()).$transaction(async (tx) => {
      // Atomic per-tenant counter — see src/lib/code-sequence.ts. This
      // replaces the previous find-max + 1 pattern which had a TOCTOU race.
      const code = await nextSaleCode(tx, session.tenantId);
      const created = await tx.sale.create({
        data: {
          code,
          subtotal,
          discount: input.discount || 0,
          total,
          paid: total,
          paymentMethod: input.paymentMethod,
          status: "paid",
          note: input.note || null,
          customerId: resolvedCustomerId,
          userId: session.id,
          tenantId: session.tenantId,
          items: {
            create: input.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              discount: i.discount || 0,
              subtotal: i.unitPrice * i.quantity - (i.discount || 0),
              imei: i.imei || null,
            })),
          },
        },
      });

      // Reduce stock for non-service items
      for (const item of input.items) {
        const p = products.find((x) => x.id === item.productId);
        if (p && p.category.type !== "service") {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return created;
    });

    revalidatePath("/");
    revalidatePath("/sales");
    revalidatePath("/products");
    return { ok: true as const, id: sale.id, code: sale.code };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra khi tạo hoá đơn" };
  }
}
