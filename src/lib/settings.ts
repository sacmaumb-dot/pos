import { prisma } from "./prisma";
import { headers } from "next/headers";
import type { Tenant } from "@/generated/prisma";

export type AppSettings = {
  shopName: string;
  siteTitle: string;
  shopTagline: string;
  shopAddress: string | null;
  shopPhone: string | null;
  shopEmail: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  printSize: string; // "A4" | "80mm"
  bankId: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
};

export const DEFAULT_SETTINGS: AppSettings = {
  shopName: "MyPOS",
  siteTitle: "MyPOS - Hệ thống quản lý Shop Laptop & Điện thoại",
  shopTagline: "Laptop & Điện thoại",
  shopAddress: null,
  shopPhone: null,
  shopEmail: null,
  logoUrl: null,
  faviconUrl: null,
  printSize: "A4",
  bankId: null,
  bankAccount: null,
  bankAccountName: null,
};

export async function getTenantFromHeader(): Promise<Tenant | null> {
  const headersList = await headers();
  const slug = headersList.get("x-tenant-slug");
  if (!slug) return null;

  // Runs before session is established (subdomain → tenant lookup), so we
  // must use the raw prisma client. Replace the previous $queryRawUnsafe
  // with a typed Prisma call.
  return prisma.tenant.findUnique({ where: { slug } });
}

export async function getSettings(): Promise<AppSettings> {
  const tenant = await getTenantFromHeader();
  if (!tenant) return DEFAULT_SETTINGS;

  const s = await prisma.appSetting.findFirst({
    where: { tenantId: tenant.id },
  });
  if (!s) return DEFAULT_SETTINGS;
  return {
    shopName: s.shopName,
    siteTitle: s.siteTitle,
    shopTagline: s.shopTagline,
    shopAddress: s.shopAddress,
    shopPhone: s.shopPhone,
    shopEmail: s.shopEmail,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    printSize: s.printSize,
    bankId: s.bankId ?? null,
    bankAccount: s.bankAccount ?? null,
    bankAccountName: s.bankAccountName ?? null,
  };
}
