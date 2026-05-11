"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerTenant(formData: {
  shopName: string;
  slug: string;
  adminName: string;
  email: string;
  password: string;
}) {
  try {
    const slug = formData.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    if (slug.length < 3) {
      return { ok: false, error: "Subdomain phải có ít nhất 3 ký tự viết liền không dấu!" };
    }

    // Check if tenant slug is already taken
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug }
    });
    if (existingTenant) {
      return { ok: false, error: "Tên miền phụ (Subdomain) này đã có người sử dụng!" };
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email }
    });
    if (existingUser) {
      return { ok: false, error: "Email này đã được đăng ký trên hệ thống!" };
    }

    // 1. Create Tenant with 14-Day Free Trial
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 14);

    const tenant = await prisma.tenant.create({
      data: {
        slug,
        name: formData.shopName,
        subscriptionPlan: "trial",
        trialExpiresAt: trialExpiry,
      }
    });

    // 2. Hash admin password
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    // 3. Create Admin User
    await prisma.user.create({
      data: {
        email: formData.email,
        name: formData.adminName,
        password: hashedPassword,
        role: "admin",
        tenantId: tenant.id,
      }
    });

    // 4. Create default AppSettings for new tenant
    await prisma.appSetting.create({
      data: {
        shopName: formData.shopName,
        siteTitle: `${formData.shopName} - Quản lý cửa hàng Laptop & Điện thoại`,
        shopTagline: "Laptop & Điện thoại",
        printSize: "A4",
        tenantId: tenant.id,
      }
    });

    // 5. Create default Print Templates for new tenant
    const defaultTemplates = [
      {
        slug: "sale-receipt",
        name: "Hóa đơn bán hàng",
        content: `
<div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
  <h1 style="font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">HOÁ ĐƠN BÁN HÀNG</h1>
  <div style="font-family: monospace; font-size: 12px;">{ma_phieu}</div>
  <div style="font-size: 10px; color: #666; text-transform: uppercase;">{ngay_tao}</div>
</div>
<div style="margin-bottom: 15px; font-size: 13px;">
  Chào anh/chị <strong>{ten_khach}</strong>, cảm ơn bạn đã mua hàng tại <strong>{ten_cua_hang}</strong>!<br/>
  SĐT: {sdt_khach}
</div>
<div style="margin-bottom: 15px;">{sanpham}</div>
{qr}
        `.trim(),
      },
      {
        slug: "service-intake",
        name: "Phiếu nhận máy",
        content: `
<div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
  <h1 style="font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">PHIẾU NHẬN MÁY</h1>
  <div style="font-family: monospace; font-size: 12px;">{ma_phieu}</div>
  <div style="font-size: 10px; color: #666; text-transform: uppercase;">Tiếp nhận: {ngay_tao}</div>
</div>
<div style="margin-bottom: 15px; font-size: 13px;">
  <strong>Khách hàng:</strong> {ten_khach}<br/>
  <strong>SĐT:</strong> {sdt_khach}
</div>
<div style="margin-bottom: 15px; border: 1px solid #eee; border-radius: 4px; padding: 10px; font-size: 13px;">
  <strong>Tên máy:</strong> {ten_may}<br/>
  <strong>IMEI/Serial:</strong> {imei}
</div>
<div style="margin-bottom: 15px;">{sanpham}</div>
        `.trim(),
      },
      {
        slug: "service-return",
        name: "Phiếu trả máy",
        content: `
<div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
  <h1 style="font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">PHIẾU TRẢ MÁY</h1>
  <div style="font-family: monospace; font-size: 12px;">{ma_phieu}</div>
</div>
<div style="margin-bottom: 15px; font-size: 13px;">
  <strong>Khách hàng:</strong> {ten_khach}<br/>
  <strong>Thiết bị:</strong> {ten_may}
</div>
<div style="margin-bottom: 15px;">{sanpham}</div>
{qr}
        `.trim(),
      },
    ];

    for (const t of defaultTemplates) {
      await prisma.printTemplate.create({
        data: {
          ...t,
          tenantId: tenant.id,
        }
      });
    }

    // 6. Create default Categories for new tenant
    const defaultCategories = [
      { name: "Laptop", slug: "laptop", type: "laptop", skuPrefix: "LT", icon: "laptop" },
      { name: "Điện thoại", slug: "dien-thoai", type: "phone", skuPrefix: "DT", icon: "smartphone" },
      { name: "Phụ kiện", slug: "phu-kien", type: "accessory", skuPrefix: "PK", icon: "headphones" },
      { name: "Dịch vụ sửa chữa", slug: "dich-vu", type: "service", skuPrefix: "DV", icon: "wrench" },
    ];

    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: {
          ...cat,
          tenantId: tenant.id,
        }
      });
    }

    return { ok: true, slug };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { ok: false, error: "Đã xảy ra lỗi không xác định. Vui lòng thử lại!" };
  }
}
