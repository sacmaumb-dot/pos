"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { nextCustomerCode } from "@/lib/code-sequence";

export async function createCustomer(data: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  note?: string;
}) {
  try {
    await requireSession();
    
    const code = await nextCustomerCode(prisma);
    await prisma.customer.create({
      data: {
        code,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        note: data.note || null,
      },
    });
    revalidatePath("/customers");
    return { ok: true as const };
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return { ok: false as const, error: "Số điện thoại hoặc mã đã tồn tại" };
    }
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}

export async function updateCustomer(
  id: string,
  data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    note?: string;
  },
) {
  try {
    await requireSession();
    await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        note: data.note || null,
      },
    });
    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return { ok: true as const };
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return { ok: false as const, error: "Số điện thoại đã tồn tại" };
    }
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await requireSession();
    const used = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: { select: { id: true }, take: 1 },
        serviceTickets: { select: { id: true }, take: 1 },
      },
    });
    if (!used) return { ok: false as const, error: "Khách hàng không tồn tại" };
    if (used.sales.length || used.serviceTickets.length) {
      return {
        ok: false as const,
        error: "Khách hàng đã có giao dịch, không thể xoá",
      };
    }
    await prisma.customer.delete({ where: { id } });
    revalidatePath("/customers");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}
