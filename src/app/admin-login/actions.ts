"use server";

import { login } from "@/lib/auth";
import { headers } from "next/headers";

export async function adminLoginAction(email: string, password: string) {
  try {
    const headersList = await headers();
    const user = await login(email, password, {
      userAgent: headersList.get("user-agent"),
      ipAddress: headersList.get("x-forwarded-for") || "127.0.0.1",
      tenantSlug: null, // Admin login is always on root domain
    });

    if (typeof user === "string") {
      return { ok: false as const, error: user };
    }

    if (!user) {
      return { ok: false as const, error: "Email hoặc mật khẩu không đúng." };
    }

    if (!user.isSuperAdmin) {
      return {
        ok: false as const,
        error: "Truy cập bị từ chối. Chỉ dành cho Quản trị viên hệ thống.",
      };
    }

    return { ok: true as const };
  } catch (error) {
    console.error("Admin login error:", error);
    return { ok: false as const, error: "Có lỗi xảy ra. Vui lòng thử lại." };
  }
}
