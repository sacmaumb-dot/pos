"use server";

import { getTenantPrismaServer } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath, updateTag } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function requireAdmin() {
  const s = await getSession();
  if (!s || s.role !== "admin") return null;
  return s;
}

const SETTING_ID = "singleton";

export async function updateSettings(data: {
  shopName: string;
  siteTitle: string;
  shopTagline: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  printSize: string;
  bankId: string;
  bankAccount: string;
  bankAccountName: string;
}) {
  try {
    if (!(await requireAdmin())) {
      return { ok: false as const, error: "Không có quyền" };
    }
    const existing = await (await getTenantPrismaServer()).$queryRawUnsafe<any[]>(
      "SELECT id FROM AppSetting WHERE id = 'singleton'"
    );
    if (existing && existing.length > 0) {
      await (await getTenantPrismaServer()).$executeRawUnsafe(
        `UPDATE AppSetting 
         SET shopName = ?, siteTitle = ?, shopTagline = ?, shopAddress = ?, shopPhone = ?, shopEmail = ?, printSize = ?, bankId = ?, bankAccount = ?, bankAccountName = ?
         WHERE id = 'singleton'`,
        data.shopName,
        data.siteTitle,
        data.shopTagline,
        data.shopAddress || null,
        data.shopPhone || null,
        data.shopEmail || null,
        data.printSize,
        data.bankId || null,
        data.bankAccount || null,
        data.bankAccountName || null
      );
    } else {
      await (await getTenantPrismaServer()).$executeRawUnsafe(
        `INSERT INTO AppSetting (id, shopName, siteTitle, shopTagline, shopAddress, shopPhone, shopEmail, printSize, bankId, bankAccount, bankAccountName, updatedAt)
         VALUES ('singleton', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        data.shopName,
        data.siteTitle,
        data.shopTagline,
        data.shopAddress || null,
        data.shopPhone || null,
        data.shopEmail || null,
        data.printSize,
        data.bankId || null,
        data.bankAccount || null,
        data.bankAccountName || null
      );
    }
    updateTag("app-settings");
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}

export async function uploadAsset(formData: FormData) {
  try {
    if (!(await requireAdmin())) {
      return { ok: false as const, error: "Không có quyền" };
    }
    const file = formData.get("file") as File | null;
    const kind = formData.get("kind") as string | null; // logo | favicon
    if (!file || !kind) {
      return { ok: false as const, error: "Thiếu file" };
    }
    if (file.size > 2 * 1024 * 1024) {
      return { ok: false as const, error: "File tối đa 2MB" };
    }
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const safeExt = ["png", "jpg", "jpeg", "webp", "svg", "ico"].includes(ext)
      ? ext
      : "png";
    const fileName = `${kind}-${Date.now()}.${safeExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buf);
    const url = `/uploads/${fileName}`;
    const adminS = await getSession();
    const tenantId = adminS?.tenantId || "singleton";

    const existing = await (await getTenantPrismaServer()).$queryRawUnsafe<any[]>(
      "SELECT id FROM AppSetting WHERE tenantId = ?",
      tenantId
    );
    if (existing && existing.length > 0) {
      await (await getTenantPrismaServer()).$executeRawUnsafe(
        `UPDATE AppSetting SET ${kind === "favicon" ? "faviconUrl" : "logoUrl"} = ? WHERE tenantId = ?`,
        url,
        tenantId
      );
    } else {
      await (await getTenantPrismaServer()).$executeRawUnsafe(
        `INSERT INTO AppSetting (id, ${kind === "favicon" ? "faviconUrl" : "logoUrl"}, tenantId, updatedAt) VALUES (?, ?, ?, datetime('now'))`,
        Math.random().toString(),
        url,
        tenantId
      );
    }
    updateTag("app-settings");
    revalidatePath("/", "layout");
    return { ok: true as const, url };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Lỗi upload file" };
  }
}

export async function clearAsset(kind: "logo" | "favicon") {
  try {
    if (!(await requireAdmin())) {
      return { ok: false as const, error: "Không có quyền" };
    }
    const adminS = await getSession();
    const tenantId = adminS?.tenantId || "singleton";

    await (await getTenantPrismaServer()).$executeRawUnsafe(
      `UPDATE AppSetting SET ${kind === "favicon" ? "faviconUrl" : "logoUrl"} = NULL WHERE tenantId = ?`,
      tenantId
    );
    updateTag("app-settings");
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}
