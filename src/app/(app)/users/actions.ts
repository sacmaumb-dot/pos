"use server";

import { getTenantPrismaServer } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getPlan } from "@/lib/plans";
import { getTenantFromHeader } from "@/lib/settings";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  branchId?: string;
}) {
  try {
    const s = await requireAdmin();
    if (!s) return { ok: false as const, error: "Không có quyền" };
    
    const tenant = await getTenantFromHeader();
    if (tenant) {
      const plan = getPlan(tenant.subscriptionPlan);
      const count = await (await getTenantPrismaServer()).user.count();
      if (count >= plan.maxUsers) {
        return { ok: false as const, error: `Gói ${plan.name} giới hạn tối đa ${plan.maxUsers} tài khoản. Vui lòng nâng cấp!` };
      }
    }

    const hash = await bcrypt.hash(data.password, 10);
    await (await getTenantPrismaServer()).user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hash,
        role: data.role,
        tenantId: s.tenantId,
        branchId: data.branchId || null,
      },
    });
    revalidatePath("/users");
    return { ok: true as const };
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return { ok: false as const, error: "Email đã tồn tại" };
    }
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}

export async function updateUser(
  id: string,
  data: {
    name: string;
    email: string;
    role: string;
    active: boolean;
    branchId?: string;
    password?: string;
  },
) {
  try {
    const s = await requireAdmin();
    if (!s) return { ok: false as const, error: "Không có quyền" };
    const update: {
      name: string;
      email: string;
      role: string;
      active: boolean;
      branchId?: string;
      password?: string;
    } = {
      name: data.name,
      email: data.email,
      role: data.role,
      active: data.active,
      branchId: data.branchId || null,
    };
    if (data.password && data.password.trim()) {
      update.password = await bcrypt.hash(data.password, 10);
    }
    await (await getTenantPrismaServer()).user.update({ where: { id }, data: update });
    revalidatePath("/users");
    return { ok: true as const };
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return { ok: false as const, error: "Email đã tồn tại" };
    }
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}

export async function deleteUser(id: string) {
  try {
    const s = await requireAdmin();
    if (!s) return { ok: false as const, error: "Không có quyền" };
    if (s.id === id) {
      return {
        ok: false as const,
        error: "Không thể xoá tài khoản đang đăng nhập",
      };
    }
    const used = await (await getTenantPrismaServer()).user.findUnique({
      where: { id },
      include: {
        sales: { select: { id: true }, take: 1 },
        serviceTickets: { select: { id: true }, take: 1 },
        serviceAssigned: { select: { id: true }, take: 1 },
      },
    });
    if (!used) return { ok: false as const, error: "Không tìm thấy" };
    if (
      used.sales.length ||
      used.serviceTickets.length ||
      used.serviceAssigned.length
    ) {
      return {
        ok: false as const,
        error: "Tài khoản đã có giao dịch, hãy tạm khoá thay vì xoá",
      };
    }
    await (await getTenantPrismaServer()).user.delete({ where: { id } });
    revalidatePath("/users");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}
