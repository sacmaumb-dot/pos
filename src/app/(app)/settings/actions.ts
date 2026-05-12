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
    const session = (await getSession())!;
    const tp = await getTenantPrismaServer();
    const payload = {
      shopName: data.shopName,
      siteTitle: data.siteTitle,
      shopTagline: data.shopTagline,
      shopAddress: data.shopAddress || null,
      shopPhone: data.shopPhone || null,
      shopEmail: data.shopEmail || null,
      printSize: data.printSize,
      bankId: data.bankId || null,
      bankAccount: data.bankAccount || null,
      bankAccountName: data.bankAccountName || null,
    };

    // AppSetting has no @@unique([tenantId]) constraint, so we cannot use
    // upsert with a tenantId-only where. Use findFirst (tenant-scoped via
    // the extension) and then update-or-create.
    const existing = await tp.appSetting.findFirst({ select: { id: true } });
    if (existing) {
      await tp.appSetting.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await tp.appSetting.create({
        data: { ...payload, tenantId: session.tenantId },
      });
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
    if (kind !== "logo" && kind !== "favicon") {
      return { ok: false as const, error: "Loại file không hợp lệ" };
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

    const session = (await getSession())!;
    const tp = await getTenantPrismaServer();
    const field = kind === "favicon" ? "faviconUrl" : "logoUrl";
    const existing = await tp.appSetting.findFirst({ select: { id: true } });
    if (existing) {
      await tp.appSetting.update({
        where: { id: existing.id },
        data: { [field]: url },
      });
    } else {
      await tp.appSetting.create({
        data: { [field]: url, tenantId: session.tenantId },
      });
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
    if (kind !== "logo" && kind !== "favicon") {
      return { ok: false as const, error: "Loại file không hợp lệ" };
    }
    const tp = await getTenantPrismaServer();
    const field = kind === "favicon" ? "faviconUrl" : "logoUrl";
    const existing = await tp.appSetting.findFirst({ select: { id: true } });
    if (existing) {
      await tp.appSetting.update({
        where: { id: existing.id },
        data: { [field]: null },
      });
    }
    updateTag("app-settings");
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Có lỗi xảy ra" };
  }
}
