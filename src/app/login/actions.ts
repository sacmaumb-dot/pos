"use server";

import { login } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function loginAction(email: string, password: string) {
  try {
    const headersList = await headers();
    const user = await login(email, password, {
      userAgent: headersList.get("user-agent"),
      ipAddress: headersList.get("x-forwarded-for") || "127.0.0.1",
      tenantSlug: headersList.get("x-tenant-slug") || null
    });
    
    if (typeof user === "string") {
      return { ok: false as const, error: user };
    }
    
    if (!user) {
      return { ok: false as const, error: "Email hoặc mật khẩu không đúng" };
    }
    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    return { ok: true as const, tenantSlug: tenant?.slug, isSuperAdmin: user.isSuperAdmin };
  } catch (error) {
    console.error(error);
    return { ok: false as const, error: "Có lỗi xảy ra. Vui lòng thử lại." };
  }
}
