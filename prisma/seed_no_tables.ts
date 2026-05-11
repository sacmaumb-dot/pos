import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const COMMON_STYLES = `
<style>
  .premium-receipt { font-family: 'Inter', sans-serif; color: #000; line-height: 1.5; padding: 0; }
  .flex-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .flex-col { flex: 1; }
  .section-label { font-size: 10px; font-weight: bold; color: #888; text-transform: uppercase; margin-top: 20px; margin-bottom: 5px; border-bottom: 1px solid #f0f0f0; }
  .field-group { margin-bottom: 10px; }
  .field-label { font-size: 11px; color: #888; }
  .field-value { font-size: 14px; font-weight: 500; }
  /* Bảng sản phẩm không viền */
  .clean-table { width: 100%; border-collapse: collapse; margin: 15px 0; border: none !important; }
  .clean-table th, .clean-table td { border: none !important; padding: 8px 0; text-align: left; }
  .clean-table th { font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase; }
  .total-block { margin-top: 20px; text-align: right; }
  .total-item { margin-bottom: 5px; }
</style>
`;

const SALE_LAYOUT = `
${COMMON_STYLES}
<div class="premium-receipt">
  <div class="flex-row" style="align-items: flex-start; margin-bottom: 30px;">
    <div><h2 style="margin: 0; font-size: 22px; font-weight: 800;">{ten_cua_hang}</h2></div>
    <div style="text-align: right;">
      <h1 style="margin: 0; font-size: 18px; font-weight: 800;">HOÁ ĐƠN BÁN HÀNG</h1>
      <div style="font-size: 14px; font-weight: 600;">{ma_phieu}</div>
      <div style="font-size: 11px; color: #888;">{ngay_tao}</div>
    </div>
  </div>

  <div class="section-label">Thông tin khách hàng</div>
  <div class="flex-row">
    <div class="flex-col">
      <div class="field-label">Khách hàng</div>
      <div class="field-value">{ten_khach}</div>
    </div>
    <div class="flex-col" style="text-align: right;">
      <div class="field-label">Số điện thoại</div>
      <div class="field-value">{sdt_khach}</div>
    </div>
  </div>
  <div class="field-group">
    <div class="field-label">Địa chỉ</div>
    <div class="field-value">{dia_chi_khach}</div>
  </div>

  <div class="section-label">Chi tiết đơn hàng</div>
  <div style="border: none;">{sanpham}</div>

  <div class="total-block">
    <div class="total-item">
      <span style="font-size: 13px; color: #888;">Tạm tính:</span>
      <span style="font-size: 14px; font-weight: 500;">{tam_tinh}</span>
    </div>
    <div class="total-item">
      <span style="font-size: 13px; color: #888;">Chiết khấu:</span>
      <span style="font-size: 14px; font-weight: 500; color: #ef4444;">-{chiet_khau}</span>
    </div>
    <div class="total-item" style="margin-top: 10px;">
      <span style="font-size: 16px; font-weight: 800;">TỔNG CỘNG:</span>
      <span style="font-size: 22px; font-weight: 800; color: #2563eb;">{tong_cong}</span>
    </div>
  </div>

  <div class="section-label">Ghi chú</div>
  <div style="font-size: 13px;">{ghi_chu}</div>

  <div class="flex-row" style="margin-top: 50px; text-align: center;">
    <div class="flex-col">
      <div style="font-size: 13px; font-weight: bold; margin-bottom: 60px;">KHÁCH HÀNG</div>
      <div style="font-size: 11px; color: #ccc;">(Ký và ghi rõ họ tên)</div>
    </div>
    <div class="flex-col">
      <div style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">NHÂN VIÊN BÁN HÀNG</div>
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 35px;">{ten_nhan_vien}</div>
      <div style="font-size: 11px; color: #ccc;">(Ký xác nhận)</div>
    </div>
  </div>
</div>
`.trim();

const INTAKE_LAYOUT = `
${COMMON_STYLES}
<div class="premium-receipt">
  <div class="flex-row" style="align-items: flex-start; margin-bottom: 30px;">
    <div><h2 style="margin: 0; font-size: 22px; font-weight: 800;">{ten_cua_hang}</h2></div>
    <div style="text-align: right;">
      <h1 style="margin: 0; font-size: 18px; font-weight: 800;">PHIẾU TIẾP NHẬN</h1>
      <div style="font-size: 14px; font-weight: 600;">{ma_phieu}</div>
      <div style="font-size: 11px; color: #888;">{ngay_tao}</div>
    </div>
  </div>

  <div class="section-label">Khách hàng</div>
  <div class="flex-row">
    <div class="flex-col">
      <div class="field-label">Họ và tên</div>
      <div class="field-value">{ten_khach}</div>
    </div>
    <div class="flex-col" style="text-align: right;">
      <div class="field-label">Điện thoại</div>
      <div class="field-value">{sdt_khach}</div>
    </div>
  </div>

  <div class="section-label">Thiết bị & Tình trạng</div>
  <div class="flex-row">
    <div class="flex-col">
      <div class="field-label">Thiết bị</div>
      <div class="field-value">{ten_may} ({loai_may})</div>
    </div>
    <div class="flex-col" style="text-align: right;">
      <div class="field-label">Hãng sản xuất</div>
      <div class="field-value">{hang}</div>
    </div>
  </div>
  <div class="field-group">
    <div class="field-label">Số IMEI / Serial</div>
    <div class="field-value">{imei}</div>
  </div>
  <div class="field-group">
    <div class="field-label">Yêu cầu & Tình trạng máy</div>
    <div class="field-value" style="font-size: 15px;">{tinh_trang}</div>
  </div>

  <div class="section-label">Dự toán phí sửa chữa</div>
  <div style="border: none;">{sanpham}</div>

  <div class="total-block">
    <div class="total-item">
      <span style="font-size: 15px; font-weight: 800;">DỰ TOÁN TỔNG:</span>
      <span style="font-size: 20px; font-weight: 800; color: #2563eb;">{tong_cong}</span>
    </div>
    <div class="total-item">
      <span style="font-size: 13px; color: #888;">Đã đặt cọc:</span>
      <span style="font-size: 14px; font-weight: 600; color: #059669;">{da_thanh_toan}</span>
    </div>
  </div>

  <div class="section-label">Cam kết cửa hàng</div>
  <div style="font-size: 11px; color: #666; line-height: 1.6;">
    • Cam kết linh kiện chính hãng hoặc theo thỏa thuận.<br>
    • Bảo mật tuyệt đối dữ liệu khách hàng.<br>
    • Quý khách vui lòng mang phiếu này khi đến nhận máy.
  </div>

  <div class="flex-row" style="margin-top: 50px; text-align: center;">
    <div class="flex-col">
      <div style="font-size: 13px; font-weight: bold; margin-bottom: 60px;">XÁC NHẬN KHÁCH HÀNG</div>
      <div style="font-size: 11px; color: #ccc;">(Ký tên)</div>
    </div>
    <div class="flex-col">
      <div style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">NHÂN VIÊN TIẾP NHẬN</div>
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 35px;">{ten_nhan_vien}</div>
      <div style="font-size: 11px; color: #ccc;">(Ký tên)</div>
    </div>
  </div>
</div>
`.trim();

async function main() {
  const templates = [
    { slug: "sale-receipt", name: "Hóa đơn bán hàng", content: SALE_LAYOUT },
    { slug: "service-intake", name: "Phiếu nhận máy", content: INTAKE_LAYOUT },
    { slug: "service-return", name: "Phiếu trả máy", content: INTAKE_LAYOUT.replace("PHIẾU TIẾP NHẬN", "PHIẾU TRẢ MÁY").replace("Dự toán phí sửa chữa", "Chi tiết dịch vụ") },
  ];

  for (const t of templates) {
    await prisma.printTemplate.upsert({
      where: { slug: t.slug },
      update: { content: t.content },
      create: t,
    });
  }
  console.log("No-Table No-Grid Premium templates seeded successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
