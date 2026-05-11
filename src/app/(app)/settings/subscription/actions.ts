"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function upgradePlan(plan: string, months: number = 1) {
  try {
    const session = await requireSession();
    if (session.role !== "admin" && !session.isSuperAdmin) {
      return { ok: false, error: "Chỉ quản trị viên mới có quyền nâng cấp gói." };
    }

    // Set expiry based on months
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);

    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        subscriptionPlan: plan,
        subscriptionExpiresAt: expiry,
      }
    });

    revalidatePath("/settings/subscription");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Đã xảy ra lỗi khi nâng cấp gói." };
  }
}
