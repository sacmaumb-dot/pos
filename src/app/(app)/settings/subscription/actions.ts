"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Self-service plan upgrade is intentionally gated.
 *
 * Previously this action allowed any tenant admin to call upgradePlan(plan,
 * months) and instantly receive a paid subscription with no payment proof.
 * There is no payment integration in the codebase yet, so we cannot reliably
 * verify that money has actually changed hands here — we would just be
 * trusting the client.
 *
 * Until a payment provider is integrated:
 *   - Super-admins can still upgrade any tenant via
 *     src/app/admin/tenants/actions.ts → updateTenantPlan (existing flow).
 *   - Tenant admins are told to contact support, and this action returns
 *     ok:false. The UI on /settings/subscription should treat the upgrade
 *     button as a "request a callback" CTA.
 */
export async function upgradePlan(_plan: string, _months: number = 1) {
  try {
    const session = await requireSession();
    if (session.role !== "admin" && !session.isSuperAdmin) {
      return { ok: false, error: "Chỉ quản trị viên mới có quyền nâng cấp gói." };
    }

    // Super-admins can self-upgrade their own tenant (rare, but they would
    // otherwise have to use the /admin tenants page). For everyone else,
    // direct upgrade is disabled.
    if (!session.isSuperAdmin) {
      return {
        ok: false,
        error:
          "Để nâng cấp gói, vui lòng liên hệ bộ phận hỗ trợ. Đội ngũ của chúng tôi sẽ hỗ trợ thanh toán và kích hoạt gói cho bạn.",
      };
    }

    const plan = _plan;
    const months = _months;
    if (!["trial", "basic", "pro", "professional"].includes(plan)) {
      return { ok: false, error: "Gói không hợp lệ." };
    }
    if (!Number.isInteger(months) || months < 1 || months > 36) {
      return { ok: false, error: "Số tháng không hợp lệ." };
    }

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);

    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        subscriptionPlan: plan,
        subscriptionExpiresAt: expiry,
      },
    });

    revalidatePath("/settings/subscription");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Đã xảy ra lỗi khi nâng cấp gói." };
  }
}
