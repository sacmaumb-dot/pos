import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALE_LAYOUT = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; color: #000; max-width: 100%; margin: 0 auto; padding: 0; line-height: 1.4;">
  <!-- Branding Header -->
  <div style="text-align: center; margin-bottom: 25px;">
    <div style="font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">{ten_cua_hang}</div>
    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #333;">{shop_tagline}</div>
    <div style="margin: 10px auto; width: 40px; border-bottom: 3px solid #000;"></div>
    [if:dia_chi_cua_hang]
    <div style="font-size: 10px; margin-top: 8px;">{dia_chi_cua_hang}</div>
    [/if]
    [if:sdt_cua_hang]
    <div style="font-size: 11px; font-weight: bold; margin-top: 2px;">Hotline: {sdt_cua_hang}</div>
    [/if]
  </div>

  <!-- Receipt Title & Info -->
  <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 12px 0; margin-bottom: 20px;">
    <div style="flex: 1.2;">
      <div style="font-size: 18px; font-weight: 800; text-transform: uppercase;">Hoá đơn bán hàng</div>
      <div style="font-size: 10px; margin-top: 2px; font-weight: 600;">KH: {ten_khach}</div>
    </div>
    <div style="text-align: right; flex: 0.8;">
      <div style="font-size: 11px; font-weight: bold;">#{ma_phieu}</div>
      <div style="font-size: 10px; color: #333;">{ngay_gio_tao}</div>
    </div>
  </div>

  [if:sdt_khach]
  <div style="font-size: 11px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
    <div style="display: flex; justify-content: space-between;">
      <span>Điện thoại:</span>
      <span style="font-weight: bold;">{sdt_khach}</span>
    </div>
  </div>
  [/if]

  <div style="margin-bottom: 25px;">
    {sanpham}
  </div>

  <div style="padding-top: 10px; font-size: 13px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
      <span style="text-transform: uppercase; font-size: 11px; font-weight: 600;">Tạm tính:</span>
      <span style="font-weight: bold;">{tam_tinh}</span>
    </div>
    [if:chiet_khau]
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
      <span style="text-transform: uppercase; font-size: 11px; font-weight: 600;">Chiết khấu:</span>
      <span style="font-weight: bold;">-{chiet_khau}</span>
    </div>
    [/if]
    
    <div style="margin: 15px 0; border-top: 2px solid #000; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 18px; font-weight: 900; text-transform: uppercase;">Thành tiền</div>
      <div style="font-size: 24px; font-weight: 900;">{tong_cong}</div>
    </div>

    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #444;">
      <span>Phương thức thanh toán:</span>
      <span style="font-weight: bold; text-transform: uppercase;">{payment_method}</span>
    </div>
    
    [if:con_no]
    <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #000; font-weight: 900; font-size: 14px;">
      <span>CÒN NỢ:</span>
      <span>{con_no}</span>
    </div>
    [/if]
  </div>

  <div style="margin-top: 40px; text-align: center;">
    {qr}
    <div style="margin: 20px auto; width: 60px; border-bottom: 1px solid #000;"></div>
    <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Cảm ơn quý khách!</div>
    <div style="font-size: 10px; margin-top: 5px; font-style: italic;">Hóa đơn có giá trị bảo hành theo từng linh kiện.</div>
    <div style="margin-top: 15px; font-size: 9px; font-weight: bold;">{ten_cua_hang} - CHẤT LƯỢNG LÀM NÊN THƯƠNG HIỆU</div>
  </div>
</div>
`.trim();

const INTAKE_LAYOUT = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; color: #000; max-width: 100%; margin: 0 auto; padding: 0; line-height: 1.4;">
  <!-- Branding Header -->
  <div style="text-align: center; margin-bottom: 25px;">
    <div style="font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">{ten_cua_hang}</div>
    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #333;">{shop_tagline}</div>
    <div style="margin: 10px auto; width: 40px; border-bottom: 2px solid #000;"></div>
    [if:dia_chi_cua_hang]
    <div style="font-size: 10px; margin-top: 5px;">Đ/C: {dia_chi_cua_hang}</div>
    [/if]
    [if:sdt_cua_hang]
    <div style="font-size: 11px; font-weight: bold; margin-top: 2px;">Hotline: {sdt_cua_hang}</div>
    [/if]
  </div>

  <!-- Title & Info -->
  <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 12px 0; margin-bottom: 15px;">
    <div style="flex: 1.2;">
      <div style="font-size: 18px; font-weight: 800; text-transform: uppercase;">Phiếu nhận máy</div>
      <div style="font-size: 10px; margin-top: 2px; font-weight: 600;">KH: {ten_khach}</div>
    </div>
    <div style="text-align: right; flex: 0.8;">
      <div style="font-size: 11px; font-weight: bold;">#{ma_phieu}</div>
      <div style="font-size: 10px; color: #333;">{ngay_gio_tao}</div>
    </div>
  </div>

  <div style="font-size: 11px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
    <div style="display: flex; justify-content: space-between;">
      <span>Điện thoại khách:</span>
      <span style="font-weight: bold;">{sdt_khach}</span>
    </div>
  </div>

  <!-- Section 1: Device -->
  <div style="margin-bottom: 20px;">
    <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; background: #000; color: #fff; padding: 3px 8px; display: inline-block;">1. Thông tin thiết bị</div>
    <div style="font-size: 12px; line-height: 1.6; margin-top: 8px;">
      <div>Hãng máy: <strong style="font-size: 13px;">{hang}</strong></div>
      <div>Model máy: <strong style="font-size: 13px;">{model}</strong></div>
      <div style="margin-top: 8px;">
        <div style="font-weight: bold; text-decoration: underline;">Lỗi yêu cầu sửa:</div>
        <div style="font-size: 14px; font-weight: 900; margin-top: 2px;">{loi_yeu_cau}</div>
      </div>
      <div style="margin-top: 8px;">
        <div style="font-weight: bold; text-decoration: underline;">Tình trạng ngoại quan:</div>
        <div style="font-size: 11px; color: #333;">{tinh_trang}</div>
      </div>
    </div>
  </div>

  <!-- Section 2: Items -->
  <div style="margin-bottom: 20px; border-top: 1px solid #000; padding-top: 15px;">
    <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; background: #000; color: #fff; padding: 3px 8px; display: inline-block;">2. Linh kiện & Tạm tính</div>
    <div style="margin-top: 10px;">
      {sanpham}
    </div>
    
    <div style="margin-top: 15px; border-top: 2px solid #000; padding-top: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 15px; font-weight: 800; text-transform: uppercase;">Dự kiến chi phí</div>
        <div style="font-size: 18px; font-weight: 900;">{tam_tinh}</div>
      </div>
      [if:da_thanh_toan]
      <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 12px;">
        <span>Khách đã đặt cọc:</span>
        <span style="font-weight: bold;">{da_thanh_toan}</span>
      </div>
      [/if]
    </div>
  </div>

  <!-- Note -->
  <div style="margin-top: 20px; font-size: 10px; line-height: 1.5; color: #444; border: 1px solid #000; padding: 8px;">
    <strong>LƯU Ý:</strong> Quý khách vui lòng mang theo phiếu này khi đến nhận máy. Chúng tôi không chịu trách nhiệm về dữ liệu trong máy. Sau 30 ngày nếu không đến nhận, cửa hàng sẽ thanh lý để bù đắp chi phí.
  </div>

  <!-- Signature -->
  <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; text-align: center; text-transform: uppercase;">
    <div style="width: 45%;">
      <div style="font-weight: 900; margin-bottom: 50px;">Khách hàng ký</div>
      <div style="font-size: 9px;">(Ký và ghi rõ họ tên)</div>
    </div>
    <div style="width: 45%;">
      <div style="font-weight: 900; margin-bottom: 50px;">Người nhận máy</div>
      <div style="font-weight: 900; font-size: 12px;">{ten_nhan_vien}</div>
    </div>
  </div>
</div>
`.trim();

const RETURN_LAYOUT = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; color: #000; max-width: 100%; margin: 0 auto; padding: 0; line-height: 1.4;">
  <!-- Branding Header -->
  <div style="text-align: center; margin-bottom: 25px;">
    <div style="font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">{ten_cua_hang}</div>
    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #333;">{shop_tagline}</div>
    <div style="margin: 10px auto; width: 40px; border-bottom: 2px solid #000;"></div>
    [if:dia_chi_cua_hang]
    <div style="font-size: 10px; margin-top: 5px;">Đ/C: {dia_chi_cua_hang}</div>
    [/if]
    [if:sdt_cua_hang]
    <div style="font-size: 11px; font-weight: bold; margin-top: 2px;">Hotline: {sdt_cua_hang}</div>
    [/if]
  </div>

  <!-- Title & Info -->
  <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 12px 0; margin-bottom: 15px;">
    <div style="flex: 1.2;">
      <div style="font-size: 18px; font-weight: 800; text-transform: uppercase;">Phiếu trả máy</div>
      <div style="font-size: 10px; margin-top: 2px; font-weight: 600;">KH: {ten_khach}</div>
    </div>
    <div style="text-align: right; flex: 0.8;">
      <div style="font-size: 11px; font-weight: bold;">#{ma_phieu}</div>
      <div style="font-size: 10px; color: #333;">{ngay_gio_tao}</div>
    </div>
  </div>

  <div style="font-size: 11px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
    <div style="display: flex; justify-content: space-between;">
      <span>Điện thoại khách:</span>
      <span style="font-weight: bold;">{sdt_khach}</span>
    </div>
  </div>

  <!-- Device & Work -->
  <div style="margin-bottom: 20px;">
    <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; background: #000; color: #fff; padding: 3px 8px; display: inline-block;">Thông tin máy & Nội dung sửa</div>
    <div style="font-size: 13px; margin-top: 8px;">
      Thiết bị: <strong style="text-transform: uppercase;">{hang} {model}</strong>
    </div>
    [if:giai_phap]
    <div style="margin-top: 8px;">
      <div style="font-weight: bold; font-size: 11px; text-decoration: underline; text-transform: uppercase;">Kết quả xử lý:</div>
      <div style="font-size: 14px; font-weight: 900; margin-top: 2px; line-height: 1.4;">{giai_phap}</div>
    </div>
    [/if]
  </div>

  <!-- Items -->
  <div style="margin-bottom: 20px; border-top: 1px solid #000; padding-top: 15px;">
    <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px;">Linh kiện thay thế & Chi phí</div>
    {sanpham}
  </div>

  <!-- Totals -->
  <div style="margin-bottom: 20px; border-top: 2px solid #000; padding-top: 15px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
      <span style="text-transform: uppercase; font-weight: 600;">Tổng chi phí:</span>
      <span style="font-weight: 800;">{tong_cong}</span>
    </div>
    
    [if:da_dat_coc]
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: #444;">
      <span>- Đã đặt cọc:</span>
      <span>{da_dat_coc}</span>
    </div>
    [/if]

    [if:thanh_toan_lan_nay]
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: #444;">
      <span>- Thanh toán lần này:</span>
      <span style="font-weight: 600;">{thanh_toan_lan_nay}</span>
    </div>
    [/if]

    <div style="margin-top: 12px; border-top: 1px solid #000; padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 18px; font-weight: 900; text-transform: uppercase;">Còn lại</div>
      <div style="font-size: 22px; font-weight: 900;">{con_no}</div>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #444;">
      <span>Phương thức:</span>
      <span style="font-weight: bold; text-transform: uppercase;">{payment_method}</span>
    </div>
  </div>

  <!-- Payment QR Section (Replaces Warranty) -->
  [if:qr]
  <div style="margin-bottom: 25px; padding: 15px; border: 2px solid #000; text-align: center; border-radius: 8px;">
    <div style="font-weight: 900; text-transform: uppercase; font-size: 11px; margin-bottom: 10px; letter-spacing: 1px;">Quét mã để thanh toán {payment_method}</div>
    {qr}
  </div>
  [/if]

  <!-- Signature -->
  <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; text-align: center; text-transform: uppercase;">
    <div style="width: 45%;">
      <div style="font-weight: 900; margin-bottom: 50px;">Khách nhận máy</div>
      <div style="font-size: 9px;">(Ký và ghi rõ họ tên)</div>
    </div>
    <div style="width: 45%;">
      <div style="font-weight: 900; margin-bottom: 50px;">Người trả máy</div>
      <div style="font-weight: 900; font-size: 12px;">{ten_nhan_vien}</div>
    </div>
  </div>

  <div style="margin-top: 30px; text-align: center;">
    <div style="margin: 15px auto; width: 40px; border-bottom: 1px solid #000;"></div>
    <div style="font-size: 12px; font-weight: 900;">CẢM ƠN QUÝ KHÁCH ĐÃ TIN TƯỞNG!</div>
    <div style="font-size: 9px; margin-top: 5px; font-style: italic;">Hóa đơn có giá trị bảo hành theo từng hạng mục sửa chữa.</div>
  </div>
</div>
`.trim();

async function main() {
  console.log("Starting Personal POS seeding...");

  // 1. Create Default Branch
  const mainBranch = await prisma.branch.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      name: "Cửa hàng chính",
      address: "Mặc định",
      isMain: true,
    }
  });

  // 2. Create Default Settings
  await prisma.appSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      shopName: "TechShop",
      siteTitle: "TechShop - Quản lý Laptop & Điện thoại",
      shopTagline: "Chuyên sửa chữa Laptop & Điện thoại",
    }
  });

  // 3. Create Admin User
  const adminPwd = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@techshop.com" },
    update: {},
    create: {
      email: "admin@techshop.com",
      name: "Admin",
      password: adminPwd,
      role: "admin",
      isSuperAdmin: true,
      branchId: mainBranch.id,
    }
  });

  // 4. Default Categories
  const defaultCats = [
    { name: "Laptop", slug: "laptop", type: "laptop", skuPrefix: "LT", icon: "laptop" },
    { name: "Điện thoại", slug: "dien-thoai", type: "phone", skuPrefix: "DT", icon: "smartphone" },
    { name: "Phụ kiện", slug: "phu-kien", type: "accessory", skuPrefix: "PK", icon: "headphones" },
    { name: "Sửa chữa", slug: "dich-vu", type: "service", skuPrefix: "DV", icon: "wrench" },
  ];

  for (const cat of defaultCats) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 5. Default Templates
  const templates = [
    { slug: "sale-receipt", name: "Hóa đơn bán hàng", content: SALE_LAYOUT },
    { slug: "service-intake", name: "Phiếu nhận máy", content: INTAKE_LAYOUT },
    { slug: "service-return", name: "Phiếu trả máy", content: RETURN_LAYOUT },
  ];

  for (const t of templates) {
    await prisma.printTemplate.upsert({
      where: { slug: t.slug },
      update: { content: t.content },
      create: t,
    });
  }

  console.log("Personal POS Seeding COMPLETE! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
