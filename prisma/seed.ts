import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALE_LAYOUT = `
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
`.trim();

const INTAKE_LAYOUT = `
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
`.trim();

async function main() {
  console.log("Starting multi-tenant SaaS seeding...");

  // 1. Create Tenants
  const trialExpiry = new Date();
  trialExpiry.setDate(trialExpiry.getDate() + 14); // 14-day trial

  const tenantApple = await prisma.tenant.create({
    data: {
      slug: "applecare",
      name: "Apple Care Việt Nam",
      subscriptionPlan: "pro",
      trialExpiresAt: trialExpiry,
    }
  });

  const tenantTech = await prisma.tenant.create({
    data: {
      slug: "techshop",
      name: "TechShop Laptop & Phone",
      subscriptionPlan: "basic",
      trialExpiresAt: trialExpiry,
    }
  });

  // Admin tenant for Super Admin
  const tenantAdmin = await prisma.tenant.create({
    data: {
      slug: "admin",
      name: "Hệ thống MyPOS",
      subscriptionPlan: "professional",
      trialExpiresAt: new Date("2099-01-01"),
    }
  });

  console.log("Seeded Tenants successfully!");

  // 2. Hash Passwords
  const adminPwd = await bcrypt.hash("admin123", 10);
  const staffPwd = await bcrypt.hash("staff123", 10);

  // 3. Create Super Admin
  await prisma.user.create({
    data: {
      email: "superadmin@mypos.vn",
      name: "Hệ thống Admin",
      password: adminPwd,
      role: "admin",
      isSuperAdmin: true,
      tenantId: tenantAdmin.id,
    }
  });

  // 4. Create Users for Tenants
  await prisma.user.create({
    data: {
      email: "admin@applecare.com",
      name: "Apple Admin",
      password: adminPwd,
      role: "admin",
      tenantId: tenantApple.id,
    }
  });

  await prisma.user.create({
    data: {
      email: "admin@techshop.com",
      name: "TechShop Admin",
      password: adminPwd,
      role: "admin",
      tenantId: tenantTech.id,
    }
  });

  console.log("Seeded Users successfully!");

  // 5. Default Categories & Templates per Tenant
  const tenants = [tenantApple, tenantTech, tenantAdmin];
  const defaultCats = [
    { name: "Laptop", slug: "laptop", type: "laptop", skuPrefix: "LT", icon: "laptop" },
    { name: "Điện thoại", slug: "dien-thoai", type: "phone", skuPrefix: "DT", icon: "smartphone" },
    { name: "Phụ kiện", slug: "phu-kien", type: "accessory", skuPrefix: "PK", icon: "headphones" },
    { name: "Sửa chữa", slug: "dich-vu", type: "service", skuPrefix: "DV", icon: "wrench" },
  ];

  for (const t of tenants) {
    // Branch
    const mainBranch = await prisma.branch.create({
      data: {
        name: "Trụ sở chính",
        address: "Mặc định",
        isMain: true,
        tenantId: t.id,
      }
    });

    // Settings
    await prisma.appSetting.create({
      data: {
        shopName: t.name,
        siteTitle: `${t.name} - Quản lý cửa hàng`,
        shopTagline: "Laptop & Điện thoại",
        tenantId: t.id,
      }
    });

    // Update users of this tenant to be in the main branch
    await prisma.user.updateMany({
      where: { tenantId: t.id },
      data: { branchId: mainBranch.id }
    });

    // Categories
    for (const cat of defaultCats) {
      await prisma.category.create({
        data: { ...cat, tenantId: t.id }
      });
    }

    // Templates
    await prisma.printTemplate.create({
      data: { slug: "sale-receipt", name: "Hóa đơn bán hàng", content: SALE_LAYOUT, tenantId: t.id }
    });
    await prisma.printTemplate.create({
      data: { slug: "service-intake", name: "Phiếu nhận máy", content: INTAKE_LAYOUT, tenantId: t.id }
    });
  }

  console.log("Multi-tenant SaaS Seeding COMPLETE! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
