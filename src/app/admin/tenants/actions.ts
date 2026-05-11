"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || !session.isSuperAdmin) {
    throw new Error("Unauthorized");
  }
}

export async function toggleTenantStatus(id: string, currentStatus: boolean) {
  try {
    await requireSuperAdmin();
    await prisma.tenant.update({
      where: { id },
      data: { active: !currentStatus }
    });
    revalidatePath("/admin/tenants");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Không thể cập nhật trạng thái" };
  }
}

export async function updateTenantPlan(id: string, plan: string) {
  try {
    await requireSuperAdmin();
    await prisma.tenant.update({
      where: { id },
      data: { 
        subscriptionPlan: plan,
        subscriptionExpiresAt: plan === "trial" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days if not trial
      }
    });
    revalidatePath("/admin/tenants");
    revalidatePath("/admin/subscriptions");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Không thể cập nhật gói dịch vụ" };
  }
}
import bcrypt from "bcryptjs";

export async function createTenant(data: { name: string; slug: string; adminEmail: string; adminName: string }) {
  try {
    await requireSuperAdmin();

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug.toLowerCase(),
        trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subscriptionPlan: "trial",
        branches: {
          create: {
            name: "Trụ sở chính",
            isMain: true,
          }
        }
      },
      include: { branches: true }
    });

    const hash = await bcrypt.hash("123456", 10);
    await prisma.user.create({
      data: {
        name: data.adminName,
        email: data.adminEmail,
        password: hash,
        role: "admin",
        tenantId: tenant.id,
        branchId: tenant.branches[0].id,
      }
    });

    revalidatePath("/admin/tenants");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Không thể tạo cửa hàng" };
  }
}
